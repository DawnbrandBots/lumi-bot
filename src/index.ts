import debug from "debug";
import { Events } from "discord.js";
import { getAdminFeature } from "./application/admin/feature.ts";
import type {
    TGetBestSearchIndexEntry,
    TGetEntityByKindAndId,
    TGetSearchIndexEntries,
} from "./application/search/ports.ts";
import { resolveSearchInput } from "./application/search/resolveSearchInput.ts";
import { getLfgUseCases } from "./composition/application/lfg/useCases.ts";
import type { TSearchKind } from "./domain/search/types.ts";
import { getAdminPersistence } from "./infrastructure/admin/persistence.ts";
import { searchItemInDb } from "./infrastructure/game/persistence/searchItemInDb.ts";
import { FuseSearchEngine } from "./infrastructure/search/engine.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_CONFIGS from "./loaders/searchConfigs.ts";
import getSearchItems from "./loaders/searchItems.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";
import { getLfgAutocomplete } from "./presentation/discord/autocomplete/lfg.ts";
import { getLfgManageAutocomplete } from "./presentation/discord/autocomplete/lfgManage.ts";
import { getSearchAutocomplete } from "./presentation/discord/autocomplete/search.ts";
import type { TAllCommandRegistrationData } from "./presentation/discord/commandRegistrationData.ts";
import { getAdminCommand } from "./presentation/discord/commands/admin.ts";
import { getHelpCommand } from "./presentation/discord/commands/help.ts";
import { getLfgCommand } from "./presentation/discord/commands/lfg.ts";
import { getLfgManageCommand } from "./presentation/discord/commands/lfgManage.ts";
import { getLinksCommand } from "./presentation/discord/commands/links.ts";
import { getSearchCommand } from "./presentation/discord/commands/search.ts";
import type { TCommandRegistry } from "./presentation/discord/commands/types.ts";
import { handleClientReady } from "./presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "./presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.types.ts";

const log = debug("index.ts");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const adminFeature = getAdminFeature(getAdminPersistence({ em }));
const lfgUseCases = getLfgUseCases(em);

const getBestSearchIndexEntry: TGetBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
const getSearchIndexEntries: TGetSearchIndexEntries = (arg) => searchEngine.search(arg.input, arg.limit);

const getEntityByKindAndId: TGetEntityByKindAndId = <Kind extends TSearchKind>(arg: { kind: Kind; id: string }) =>
    searchItemInDb<Kind>({ configs: SEARCH_CONFIGS, em }, arg);

const _resolveSearchInput = (input: string) =>
    resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input);

const commands = {
    admin: { run: getAdminCommand({ adminFeature }) },
    search: {
        run: getSearchCommand({ resolveSearchInput: _resolveSearchInput }),
        autocomplete: getSearchAutocomplete({ getSearchIndexEntries }),
    },
    help: { run: getHelpCommand() },
    links: { run: getLinksCommand() },
    lfg: {
        run: getLfgCommand({
            adminFeature,
            changeOwnedLfgRoomCode: lfgUseCases.changeOwnedLfgRoomCode,
            createLfgRoom: lfgUseCases.createLfgRoom,
            disbandOwnedLfgRoom: lfgUseCases.disbandOwnedLfgRoom,
            getLfgStatus: lfgUseCases.getLfgStatus,
            kickFromOwnedLfgRoom: lfgUseCases.kickFromOwnedLfgRoom,
            leaveLfgRoom: lfgUseCases.leaveLfgRoom,
            moveLfgUser: lfgUseCases.moveLfgUser,
            transferOwnedLfgRoom: lfgUseCases.transferOwnedLfgRoom,
        }),
        autocomplete: getLfgAutocomplete({ getLfgStatus: lfgUseCases.getLfgStatus }),
    },
    "lfg-manage": {
        run: getLfgManageCommand({
            adminFeature,
            changeLfgRoomCode: lfgUseCases.changeLfgRoomCode,
            createLfgRoom: lfgUseCases.createLfgRoom,
            disbandLfgRoom: lfgUseCases.disbandLfgRoom,
            kickFromLfgRoom: lfgUseCases.kickFromLfgRoom,
            moveLfgUser: lfgUseCases.moveLfgUser,
            transferLfgRoom: lfgUseCases.transferLfgRoom,
        }),
        autocomplete: getLfgManageAutocomplete({ getLfgStatus: lfgUseCases.getLfgStatus }),
    },
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
