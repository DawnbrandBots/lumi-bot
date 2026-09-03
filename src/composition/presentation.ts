import { Events, InteractionType } from "discord.js";
import type { TApplicationUseCases } from "../application/useCases.types.ts";
import type {
    TAutocompleteHandlerGetter,
    TBuiltCommandAutocompleteHandler,
    TBuiltCommandRunHandlerGetter,
    TCommandAutocompleteHandler,
    TCommandDependencies,
} from "../presentation/discord/commands/types.ts";
import { handleClientReady as clientReadyHandler } from "../presentation/discord/eventHandlers/clientReady.ts";
import type { TInteractionCreateEventInteraction } from "../presentation/discord/eventHandlers/interactionCreate.ts";
import { handleAutocompleteInteraction } from "../presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "../presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "../presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "../presentation/discord/eventHandlers/interactions/command.types.ts";
import type { THandleMessageCreate } from "../presentation/discord/eventHandlers/messageCreate.ts";
import { handleMessageCreate } from "../presentation/discord/eventHandlers/messageCreate.ts";
import { createErrorMessage } from "../presentation/discord/message.ts";
import { AUTOCOMPLETE } from "./presentation/autocomplete.ts";
import { COMMANDS } from "./presentation/commands.ts";
import getRawAutocompleteHandlerFromHandlers from "./presentation/getAutocompleteHandler.ts";
import getRawCommandRunHandlerFromCommands from "./presentation/getCommandRunHandler.ts";
import { buildDependentFunction } from "./utils/buildDependentFunctionsRecord.ts";

export function composePresentation({ useCases }: { readonly useCases: TApplicationUseCases }) {
    const presentationDependencies = { useCases };

    const messageCreateHandler: THandleMessageCreate = (interaction) =>
        handleMessageCreate({ interaction, resolveSearchInput: useCases.search.resolveSearchInput });

    const getRawCommandRunHandler = getRawCommandRunHandlerFromCommands(COMMANDS);
    const getCommandRunHandler: TBuiltCommandRunHandlerGetter = (interaction) => {
        const command = getRawCommandRunHandler(interaction);
        // TODO: not sure buildDependentFunction is even needed here?
        return command ? buildDependentFunction(presentationDependencies, command) : undefined;
    };

    const getRawAutocompleteHandler =
        getRawAutocompleteHandlerFromHandlers<TCommandAutocompleteHandler<TCommandDependencies>>(AUTOCOMPLETE);
    const getAutocompleteHandler: TAutocompleteHandlerGetter<TBuiltCommandAutocompleteHandler> = (interaction) => {
        const autocomplete = getRawAutocompleteHandler(interaction);
        return autocomplete ? buildDependentFunction(presentationDependencies, autocomplete) : undefined;
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

    return {
        [Events.ClientReady]: clientReadyHandler,
        [Events.MessageCreate]: messageCreateHandler,
        [Events.InteractionCreate]: interactionCreateHandler,
    } as const;
}
