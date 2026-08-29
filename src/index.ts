import debug from "debug";
import { Client, Events, GatewayIntentBits } from "discord.js";
import ADMIN_USE_CASES from "./application/admin/useCases.ts";
import { changeRoomCodeInRoom } from "./application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "./application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "./application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "./application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "./application/lfg/services/transferRoom.ts";
import LFG_USE_CASES from "./application/lfg/useCases.ts";
import { generateSearchIndexEntries } from "./application/search/searchAliases.ts";
import SEARCH_USE_CASES from "./application/search/useCases.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import { build } from "./composition/utils/proxify.ts";
import type { TSearchIndexEntry } from "./domain/search/types.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";
import ADMIN_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/lfg.ts";
import SEARCH_REPOSITORIES, {
    SEARCH_ALIAS_REPOSITORIES,
} from "./infrastructure/database/mikroOrm/repositories/search.ts";
import { FuseSearchEngine, type SearchEngine } from "./infrastructure/search/engine.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
const em = orm.em.fork();

const entitiesForGeneratingSearchAliases = await SEARCH_ALIAS_REPOSITORIES.getEntitiesForGeneratingSearchAliases({
    em,
});
const searchItems = generateSearchIndexEntries(entitiesForGeneratingSearchAliases);
const searchEngine = new FuseSearchEngine({ items: searchItems });

// TODO: some funky business going on for this repository
const searchRepositories = {
    ...SEARCH_REPOSITORIES,
    getBestSearchIndexEntry: (
        { searchEngine }: { readonly searchEngine: SearchEngine<TSearchIndexEntry> },
        input: string,
    ) => searchEngine.searchOne(input),
    getSearchIndexEntries: (
        { searchEngine }: { readonly searchEngine: SearchEngine<TSearchIndexEntry> },
        { input, limit }: { readonly input: string; readonly limit?: number },
    ) => searchEngine.search(input, limit),
};

const REPOSITORIES = {
    admin: ADMIN_REPOSITORIES,
    // TODO: this is a sign repositories should be organized another way
    lfg: { ...LFG_REPOSITORIES, getGuildConfig: ADMIN_REPOSITORIES.getGuildConfig },
    search: searchRepositories,
} as const;

const APPLICATION_SERVICES = {
    lfg: {
        changeRoomCodeInRoom,
        getOwnedRoom,
        kickFromRoom,
        removePlayerFromRoom,
        transferRoom,
    },
} as const;

const USE_CASES = {
    admin: ADMIN_USE_CASES,
    lfg: LFG_USE_CASES,
    search: SEARCH_USE_CASES,
} as const;

const repositoriesDependencies = { em, searchEngine };
const builtRepositories = {
    admin: build(repositoriesDependencies, REPOSITORIES.admin),
    lfg: build(repositoriesDependencies, REPOSITORIES.lfg),
    search: build(repositoriesDependencies, REPOSITORIES.search),
};

const servicesDependencies = {
    persistence: builtRepositories.lfg,
    get services() {
        return builtLfgServices;
    },
};
const builtLfgServices = build(servicesDependencies, APPLICATION_SERVICES.lfg);
const builtServices = { lfg: builtLfgServices };

// TODO: ultimately, there should be a function that takes a record of record of useCases and builds all at once.
// TODO: should composed types be introduced for objects like builtUseCases?
const builtUseCases = {
    admin: build({ persistence: builtRepositories.admin }, USE_CASES.admin),
    lfg: build({ persistence: builtRepositories.lfg, services: builtServices.lfg }, USE_CASES.lfg),
    search: build({ persistence: builtRepositories.search }, USE_CASES.search),
};

// TODO: ALL commands should be passed as argument to build here as well, even if they technically do not need to be built every time
// ...which makes me wonder whether some commands should be handled specially
// also remember that commands can have multiple layers vs fixed layers for repositories/services/use cases
const commands = composeDiscordCommands({
    adminUseCases: builtUseCases.admin,
    lfgUseCases: builtUseCases.lfg,
    searchUseCases: builtUseCases.search,
});
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases: builtUseCases.search });

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages];
const bot = new Client({ intents });
bot.on(Events.ClientReady, eventHandlers.clientReady);
bot.on(Events.MessageCreate, eventHandlers.messageCreate);
bot.on(Events.InteractionCreate, eventHandlers.interactionCreate);
// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
