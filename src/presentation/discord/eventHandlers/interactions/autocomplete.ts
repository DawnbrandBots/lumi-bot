import type { TAllCommandRegistrationData } from "../../commandRegistrationData.ts";
import { getCommandAutocompleteHandler } from "../../commands/handlers.ts";
import type { TCommandAutocompleteRegistry } from "../../commands/types.ts";
import type { TAutocompleteInteraction } from "./autocomplete.types.ts";

export async function handleAutocompleteInteraction(arg: {
    interaction: TAutocompleteInteraction;
    autocompleteHandlers: TCommandAutocompleteRegistry<TAllCommandRegistrationData>;
}) {
    // TODO: getCommandAutocompleteHandler should become an argument as well
    const autocomplete = getCommandAutocompleteHandler(arg.autocompleteHandlers, arg.interaction);
    const choices = await autocomplete?.(arg.interaction);

    if (!choices) {
        // TODO: this should be reported in another PR
        await arg.interaction.respond([]);
        return;
    }

    await arg.interaction.respond(choices);
}
