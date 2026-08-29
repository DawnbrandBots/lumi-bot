import type { TApplicationUseCases } from "../../../application/useCases.types.ts";
import { AUTOCOMPLETE } from "../../../presentation/discord/autocomplete.ts";
import { getAutocompleteHandler as getRawAutocompleteHandlerFromHandlers } from "../../../presentation/discord/autocomplete/handlers.ts";
import { COMMANDS } from "../../../presentation/discord/commands.ts";
import {
    getCommandRunHandler as getRawCommandRunHandlerFromCommands,
    type TBuiltCommandRunHandlerGetter,
} from "../../../presentation/discord/commands/handlers.ts";
import type {
    TBuiltCommandAutocompleteHandler,
    TCommandAutocompleteHandler,
} from "../../../presentation/discord/commands/types.ts";
import { handleClientReady } from "../../../presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import type { TAutocompleteHandlerGetter } from "../../../presentation/discord/autocomplete/handlers.ts";
import { handleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.types.ts";
import { build } from "../../utils/proxify.ts";

export type TDiscordEventHandlers = {
    readonly clientReady: typeof handleClientReady;
    readonly interactionCreate: THandleInteractionCreate;
    readonly messageCreate: THandleMessageCreate;
};

export function composeDiscordEventHandlers(arg: { readonly useCases: TApplicationUseCases }): TDiscordEventHandlers {
    const messageCreate: THandleMessageCreate = (interaction) =>
        handleMessageCreate({ interaction, resolveSearchInput: arg.useCases.search.resolveSearchInput });
    // TODO: "raw" command run handler? Confirm what it is later.
    const getRawCommandRunHandler = getRawCommandRunHandlerFromCommands(COMMANDS);
    const getCommandRunHandler: TBuiltCommandRunHandlerGetter = (interaction) => {
        const command = getRawCommandRunHandler(interaction);
        return command ? build({ useCases: arg.useCases }, { command }).command : undefined;
    };
    const getRawAutocompleteHandler = getRawAutocompleteHandlerFromHandlers<TCommandAutocompleteHandler>(AUTOCOMPLETE);
    const getAutocompleteHandler: TAutocompleteHandlerGetter<TBuiltCommandAutocompleteHandler> = (interaction) => {
        const autocomplete = getRawAutocompleteHandler(interaction);
        return autocomplete ? build({ useCases: arg.useCases }, { autocomplete }).autocomplete : undefined;
    };
    const commandInteraction: THandleCommandInteraction = (interaction) =>
        handleCommandInteraction({ getCommandRunHandler, interaction });
    const autocompleteInteraction: THandleAutocompleteInteraction = (interaction) =>
        handleAutocompleteInteraction({ getAutocompleteHandler, interaction });
    const interactionCreate: THandleInteractionCreate = (interaction) =>
        handleInteractionCreate({
            handleAutocompleteInteraction: autocompleteInteraction,
            handleCommandInteraction: commandInteraction,
            interaction,
        });

    return {
        clientReady: handleClientReady,
        interactionCreate,
        messageCreate,
    };
}
