import debug from "debug";
import { Events } from "discord.js";
import { getAdminCommand } from "./admin/command/handlers.ts";
import { AdminFeature } from "./admin/feature.ts";
import { resolveSearchInput } from "./application/search/resolveSearchInput.ts";
import type { TCommandRegistry } from "./bot/commands/types.ts";
import { getHelpCommand } from "./help/command/handlers.ts";
import { searchItemInDb } from "./infrastructure/game/persistence/searchItemInDb.ts";
import type { TGetEntityByKindAndId as TGetEntityByKindAndIdInfra } from "./infrastructure/game/persistence/searchItemInDb.types.ts";
import { getLfgCommand } from "./lfg/command/handlers.ts";
import { LfgFeature } from "./lfg/feature.ts";
import { getLfgManageCommand } from "./lfgManage/command/handlers.ts";
import { getLinksCommand } from "./links/command/handlers.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_CONFIGS from "./loaders/searchConfigs.ts";
import getSearchItems from "./loaders/searchItems.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";
import type { TAllCommandRegistrationData } from "./presentation/discord/commandRegistrationData.ts";
import { handleClientReady } from "./presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.types.ts";
import { getSearchCommand } from "./search/command/handlers.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import type { TGetBestSearchIndexEntry, TGetSearchIndexEntries } from "./search/infra.types.ts";
import type { TSearchKind } from "./search/types.ts";

const log = debug("index.ts");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const adminFeature = new AdminFeature({ em });
const lfgFeature = new LfgFeature({ em });

const getBestSearchIndexEntry: TGetBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
const getSearchIndexEntries: TGetSearchIndexEntries = (arg) => searchEngine.search(arg.input, arg.limit);

const getEntityByKindAndId: TGetEntityByKindAndIdInfra = <Kind extends TSearchKind>(arg: { kind: Kind; id: string }) =>
    searchItemInDb<Kind>({ configs: SEARCH_CONFIGS, em }, arg);

const _resolveSearchInput = (input: string) =>
    resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input);

const commands = {
    admin: getAdminCommand({ adminFeature }),
    search: getSearchCommand({ getSearchIndexEntries, resolveSearchInput: _resolveSearchInput }),
    help: getHelpCommand(),
    links: getLinksCommand(),
    lfg: getLfgCommand({ adminFeature, lfgFeature }),
    "lfg-manage": getLfgManageCommand({ adminFeature, lfgFeature }),
} satisfies TCommandRegistry<TAllCommandRegistrationData>;

bot.on(Events.ClientReady, handleClientReady);

const messageCreateHandler: THandleMessageCreate = (interaction) =>
    handleMessageCreate({ interaction, resolveSearchInput: _resolveSearchInput });
bot.on(Events.MessageCreate, messageCreateHandler);

const commandInteractionHandler: THandleCommandInteraction = (interaction) =>
    handleCommandInteraction({ commands, interaction });
const autocompleteInteractionHandler: THandleAutocompleteInteraction = (interaction) =>
    handleAutocompleteInteraction({ commands, interaction });
const interactionCreateHandler: THandleInteractionCreate = (interaction) =>
    handleInteractionCreate({
        handleAutocompleteInteraction: autocompleteInteractionHandler,
        handleCommandInteraction: commandInteractionHandler,
        interaction,
    });
bot.on(Events.InteractionCreate, interactionCreateHandler);

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
