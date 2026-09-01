import debug from "debug";
import { Client, Events, GatewayIntentBits, InteractionType } from "discord.js";
import ADMIN_USE_CASES from "./application/admin/useCases.ts";
import { changeRoomCodeInRoom } from "./application/lfg/services/changeRoomCodeInRoom.ts";
import { getOwnedRoom } from "./application/lfg/services/getOwnedRoom.ts";
import { kickFromRoom } from "./application/lfg/services/kickFromRoom.ts";
import { removePlayerFromRoom } from "./application/lfg/services/removePlayerFromRoom.ts";
import { transferRoom } from "./application/lfg/services/transferRoom.ts";
import LFG_USE_CASES from "./application/lfg/useCases.ts";
import { generateSearchIndexEntries } from "./application/search/searchAliases.ts";
import SEARCH_USE_CASES from "./application/search/useCases.ts";
import getWithinTransaction from "./composition/infrastructure/withinTransaction.ts";
import { build, buildFunction } from "./composition/utils/proxify.ts";
import type { TSearchIndexEntry } from "./domain/search/types.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";
import ADMIN_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/lfg.ts";
import SEARCH_REPOSITORIES, {
    SEARCH_ALIAS_REPOSITORIES,
} from "./infrastructure/database/mikroOrm/repositories/search.ts";
import { FuseSearchEngine, type SearchEngine } from "./infrastructure/search/engine.ts";
import { AUTOCOMPLETE } from "./presentation/discord/autocomplete.ts";
import type { TAutocompleteHandlerGetter } from "./presentation/discord/autocomplete/handlers.ts";
import { getAutocompleteHandler as getRawAutocompleteHandlerFromHandlers } from "./presentation/discord/autocomplete/handlers.ts";
import { COMMANDS } from "./presentation/discord/commands.ts";
import {
    getCommandRunHandler as getRawCommandRunHandlerFromCommands,
    type TBuiltCommandRunHandlerGetter,
} from "./presentation/discord/commands/handlers.ts";
import type {
    TBuiltCommandAutocompleteHandler,
    TCommandAutocompleteHandler,
} from "./presentation/discord/commands/types.ts";
import { handleClientReady as clientReadyHandler } from "./presentation/discord/eventHandlers/clientReady.ts";
import type { TInteractionCreateEventInteraction } from "./presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "./presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "./presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "./presentation/discord/eventHandlers/messageCreate.types.ts";
import { createErrorMessage } from "./presentation/discord/message.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
// TODO: if not using RequestContext, useContext still necessary?
const em = orm.em.fork({ useContext: true });

// TODO: should be moved to a new infrastructure/database/mikroOrm/queries/ directory
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
    // TODO: might be better if repositories are organized by aggregate instead of "feature"
    admin: ADMIN_REPOSITORIES,
    lfg: LFG_REPOSITORIES,
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
    persistence: builtRepositories,
    get services() {
        return builtLfgServices;
    },
};
const builtLfgServices = build(servicesDependencies, APPLICATION_SERVICES.lfg);
const builtServices = { lfg: builtLfgServices };

const withinTransaction = getWithinTransaction(em);

// TODO: ultimately, there should be a function that takes a record of record of useCases and builds all at once.
const useCasesDependencies = { persistence: builtRepositories, services: builtServices };
// TODO: should composed types be introduced for objects like builtUseCases?
const builtUseCases = {
    admin: build(useCasesDependencies, USE_CASES.admin, withinTransaction),
    lfg: build(useCasesDependencies, USE_CASES.lfg, withinTransaction),
    search: build(useCasesDependencies, USE_CASES.search, withinTransaction),
};

const presentationDependencies = { useCases: builtUseCases };

const messageCreateHandler: THandleMessageCreate = (interaction) =>
    handleMessageCreate({ interaction, resolveSearchInput: builtUseCases.search.resolveSearchInput });

// TODO: "raw" command run handler? Confirm what it is later.
const getRawCommandRunHandler = getRawCommandRunHandlerFromCommands(COMMANDS);
const getCommandRunHandler: TBuiltCommandRunHandlerGetter = (interaction) => {
    const command = getRawCommandRunHandler(interaction);
    return command ? buildFunction(presentationDependencies, command) : undefined;
};

const getRawAutocompleteHandler = getRawAutocompleteHandlerFromHandlers<TCommandAutocompleteHandler>(AUTOCOMPLETE);
const getAutocompleteHandler: TAutocompleteHandlerGetter<TBuiltCommandAutocompleteHandler> = (interaction) => {
    const autocomplete = getRawAutocompleteHandler(interaction);
    return autocomplete ? buildFunction(presentationDependencies, autocomplete) : undefined;
};

const commandInteraction: THandleCommandInteraction = (interaction) =>
    handleCommandInteraction({ getCommandRunHandler, interaction });
const autocompleteInteraction: THandleAutocompleteInteraction = (interaction) =>
    handleAutocompleteInteraction({ getAutocompleteHandler, interaction });
const BUILT_INTERACTION_CREATE_INTERACTION_TYPE_HANDLERS: {
    [K in TInteractionCreateEventInteraction["type"]]?: (
        int: TInteractionCreateEventInteraction & { type: K },
    ) => unknown;
} = {
    [InteractionType.ApplicationCommand]: commandInteraction,
    [InteractionType.ApplicationCommandAutocomplete]: autocompleteInteraction,
};
// const getInteractionCreateInteractionTypeHandler = <K extends TInteractionCreateEventInteraction["type"]>(
//     interaction: Extract<TInteractionCreateEventInteraction, { type: K }>,
// ) => a[interaction.type];

const ACTION_WHEN_INTERACTION_HANDLER_NOT_FOUND: {
    [K in TInteractionCreateEventInteraction["type"]]?: (
        int: TInteractionCreateEventInteraction & { type: K },
    ) => unknown;
} = {
    [InteractionType.ApplicationCommand]: (interaction) =>
        interaction.reply(createErrorMessage({ embed: { description: "Command handler not found" } })),
    [InteractionType.ApplicationCommandAutocomplete]: (interaction) => interaction.respond([]),
};

function defaultHandlerIfAbsent<K extends TInteractionCreateEventInteraction["type"]>(arg: {
    interactionCreateInteractionTypeHandler: (
        interaction: TInteractionCreateEventInteraction & { type: K },
    ) => ((interaction: TInteractionCreateEventInteraction & { type: K }) => unknown) | null;
    interaction: TInteractionCreateEventInteraction & { type: K };
}) {
    return (
        arg.interactionCreateInteractionTypeHandler(arg.interaction) ??
        ACTION_WHEN_INTERACTION_HANDLER_NOT_FOUND[arg.interaction.type]
    );
}

const interactionCreateHandler = <K extends TInteractionCreateEventInteraction["type"]>(
    interaction: TInteractionCreateEventInteraction & { type: K },
) =>
    defaultHandlerIfAbsent<K>({
        interactionCreateInteractionTypeHandler: (interaction) =>
            BUILT_INTERACTION_CREATE_INTERACTION_TYPE_HANDLERS[interaction.type] ?? null,
        interaction,
    })?.(interaction);

// TODO: not needed unless returned by some function/keys iterated on
const EVENT_HANDLERS = {
    [Events.ClientReady]: clientReadyHandler,
    [Events.MessageCreate]: messageCreateHandler,
    [Events.InteractionCreate]: interactionCreateHandler,
} as const;

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages];
const bot = new Client({ intents });
bot.on(Events.ClientReady, EVENT_HANDLERS[Events.ClientReady]);
bot.on(Events.MessageCreate, EVENT_HANDLERS[Events.MessageCreate]);
bot.on(Events.InteractionCreate, EVENT_HANDLERS[Events.InteractionCreate]);
// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
