import { handleClientReady } from "../../../presentation/discord/eventHandlers/clientReady.ts";
import { handleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.ts";
import type { THandleInteractionCreate } from "../../../presentation/discord/eventHandlers/interactionCreate.types.ts";
import { handleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.ts";
import type { THandleAutocompleteInteraction } from "../../../presentation/discord/eventHandlers/interactions/autocomplete.types.ts";
import { handleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.ts";
import type { THandleCommandInteraction } from "../../../presentation/discord/eventHandlers/interactions/command.types.ts";
import { handleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.ts";
import type { THandleMessageCreate } from "../../../presentation/discord/eventHandlers/messageCreate.types.ts";
import type { TCommandRegistry } from "../../../presentation/discord/commands/types.ts";
import type { TAllCommandRegistrationData } from "../../../presentation/discord/commandRegistrationData.ts";
import type { TSearchUseCases } from "../../application/search/useCases.ts";

export type TDiscordEventHandlers = {
    readonly clientReady: typeof handleClientReady;
    readonly interactionCreate: THandleInteractionCreate;
    readonly messageCreate: THandleMessageCreate;
};

export function composeDiscordEventHandlers(arg: {
    readonly commands: TCommandRegistry<TAllCommandRegistrationData>;
    readonly searchUseCases: TSearchUseCases;
}): TDiscordEventHandlers {
    const messageCreate: THandleMessageCreate = (interaction) =>
        handleMessageCreate({ interaction, resolveSearchInput: arg.searchUseCases.resolveSearchInput });
    const commandInteraction: THandleCommandInteraction = (interaction) =>
        handleCommandInteraction({ commands: arg.commands, interaction });
    const autocompleteInteraction: THandleAutocompleteInteraction = (interaction) =>
        handleAutocompleteInteraction({ commands: arg.commands, interaction });
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
