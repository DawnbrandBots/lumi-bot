import type { TAutocompleteHandlerGetter, TBuiltCommandAutocompleteHandler } from "../../commands/types.ts";
import type { TAutocompleteInteraction } from "./autocomplete.types.ts";

export async function handleAutocompleteInteraction(arg: {
    interaction: TAutocompleteInteraction;
    getAutocompleteHandler: TAutocompleteHandlerGetter<TBuiltCommandAutocompleteHandler>;
}) {
    const autocomplete = arg.getAutocompleteHandler(arg.interaction);
    const choices = await autocomplete?.(arg.interaction);

    // TODO: this condition should be handled in a separate location
    if (!choices) {
        // TODO: this should be reported in another PR
        await arg.interaction.respond([]);
        return;
    }

    await arg.interaction.respond(choices);
}
