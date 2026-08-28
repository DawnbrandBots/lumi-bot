import type { EntityManager } from "@mikro-orm/sqlite";
import debug from "debug";
import { Client, Events, GatewayIntentBits } from "discord.js";
import type { TAdminPersistence } from "./application/admin/persistence.types.ts";
import ADMIN_USE_CASES from "./application/admin/useCases.ts";
import type { TAdminUseCaseDependencies, TAdminUseCases } from "./application/admin/useCases.types.ts";
import type { TLfgPersistence } from "./application/lfg/persistence.types.ts";
import LFG_USE_CASES from "./application/lfg/useCases.ts";
import type { TLfgUseCases } from "./application/lfg/useCases.types.ts";
import type { TGetSearchIndexEntries, TSearchPersistence } from "./application/search/persistence.types.ts";
import { generateSearchIndexEntries } from "./application/search/searchAliases.ts";
import SEARCH_USE_CASES from "./application/search/useCases.ts";
import type { TSearchUseCaseDependencies, TSearchUseCases } from "./application/search/useCases.types.ts";
import { composeLfgServices } from "./composition/application/lfg/services.ts";
import { getWithUnitOfWork } from "./composition/application/unitOfWork.ts";
import { getPersistenceWithContext, getUseCasesWithUnitOfWork } from "./composition/application/useCases.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";
import ADMIN_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/lfg.ts";
import SEARCH_REPOSITORIES, {
    SEARCH_ALIAS_REPOSITORIES,
} from "./infrastructure/database/mikroOrm/repositories/search.ts";
import { FuseSearchEngine } from "./infrastructure/search/engine.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
const em = orm.em.fork();

const withAdminUnitOfWork = getWithUnitOfWork({
    em,
    getDependencies: (em): TAdminUseCaseDependencies => ({
        persistence: getPersistenceWithContext<TAdminPersistence>({
            em,
            repositories: ADMIN_REPOSITORIES,
        }),
    }),
});
const adminUseCases = getUseCasesWithUnitOfWork<TAdminUseCases>({
    useCases: ADMIN_USE_CASES,
    withUnitOfWork: withAdminUnitOfWork,
});

const withLfgUnitOfWork = getWithUnitOfWork({
    em,
    getDependencies: (em) => {
        // TODO: kinda weird looking to have multiple persistences redefined here
        const lfgPersistence = getPersistenceWithContext<Omit<TLfgPersistence, "getGuildConfig">>({
            em,
            repositories: LFG_REPOSITORIES,
        });
        const adminPersistence = getPersistenceWithContext<Pick<TAdminPersistence, "getGuildConfig">>({
            em,
            repositories: ADMIN_REPOSITORIES,
        });
        const persistence: TLfgPersistence = {
            ...lfgPersistence,
            getGuildConfig: adminPersistence.getGuildConfig,
        };
        const services = composeLfgServices(persistence);
        return { persistence, services };
    },
});
const lfgUseCases = getUseCasesWithUnitOfWork<TLfgUseCases>({
    useCases: LFG_USE_CASES,
    withUnitOfWork: withLfgUnitOfWork,
});

const entitiesForGeneratingSearchAliases = await SEARCH_ALIAS_REPOSITORIES.getEntitiesForGeneratingSearchAliases({
    em: em.fork(),
});
const searchItems = generateSearchIndexEntries(entitiesForGeneratingSearchAliases);

const searchEngine = new FuseSearchEngine({ items: searchItems });
const getBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
const getSearchIndexEntries: TGetSearchIndexEntries = (searchArg) =>
    searchEngine.search(searchArg.input, searchArg.limit);
const getSearchDependencies = (em: EntityManager): TSearchUseCaseDependencies => {
    const searchPersistence = getPersistenceWithContext<Pick<TSearchPersistence, "getEntityByKindAndId">>({
        em,
        repositories: SEARCH_REPOSITORIES,
    });
    const persistence: TSearchPersistence = {
        getBestSearchIndexEntry,
        getEntityByKindAndId: searchPersistence.getEntityByKindAndId,
        getSearchIndexEntries,
    };
    return { persistence };
};
const withSearchUnitOfWork = getWithUnitOfWork({ em, getDependencies: getSearchDependencies });
const searchUseCases = getUseCasesWithUnitOfWork<TSearchUseCases>({
    useCases: SEARCH_USE_CASES,
    withUnitOfWork: withSearchUnitOfWork,
});
const commands = composeDiscordCommands({ adminUseCases, lfgUseCases, searchUseCases });
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases });

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages];
const bot = new Client({ intents });
bot.on(Events.ClientReady, eventHandlers.clientReady);
bot.on(Events.MessageCreate, eventHandlers.messageCreate);
bot.on(Events.InteractionCreate, eventHandlers.interactionCreate);
// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
