import debug from "debug";
import type { THandleAutocompleteInteraction } from "./interactions/autocomplete.types.ts";
import type { THandleCommandInteraction } from "./interactions/command.types.ts";
import type { TInteractionCreateEventInteraction } from "./interactionCreate.types.ts";

const log = debug(handleInteractionCreate.name);

export async function handleInteractionCreate(arg: {
    interaction: TInteractionCreateEventInteraction;
    handleAutocompleteInteraction: THandleAutocompleteInteraction;
    handleCommandInteraction: THandleCommandInteraction;
}) {
    log(arg.interaction);

    if (arg.interaction.isChatInputCommand()) {
        await arg.handleCommandInteraction(arg.interaction);
        return;
    } else if (arg.interaction.isAutocomplete()) {
        await arg.handleAutocompleteInteraction(arg.interaction);
        return;
    }
}
