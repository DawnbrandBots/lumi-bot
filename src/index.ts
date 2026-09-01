import debug from "debug";
import { Client, Events, GatewayIntentBits, InteractionType } from "discord.js";
import { composeApplication } from "./composition/application.ts";
import { composeInfrastructure } from "./composition/infrastructure.ts";
import { createSearchEngine } from "./composition/infrastructure/search.ts";
import { buildFunction } from "./composition/utils/proxify.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";
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
const searchEngine = await createSearchEngine({ em });
const { persistence, withinTransaction } = composeInfrastructure({ em, searchEngine });
const { useCases: builtUseCases } = composeApplication({
    persistence,
    useCaseMiddleware: withinTransaction,
});

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
