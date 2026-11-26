import type { AutocompleteInteraction, CacheType } from "discord.js";
import type { TAutocompleteHandlerGetter, TBuiltCommandAutocompleteHandler } from "../../commands/types.ts";

export type TAutocompleteInteraction = AutocompleteInteraction<CacheType>;
export type THandleAutocompleteInteraction = (interaction: TAutocompleteInteraction) => Promise<void>;

/** Discord invalidates autocomplete tokens shortly after the interaction is created. */
const AUTOCOMPLETE_RESPONSE_TIMEOUT_MS = 2_000;

function isUnknownInteractionError(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === 10062;
}

function getChoicesBeforeInteractionExpires(
    autocomplete: TBuiltCommandAutocompleteHandler | undefined,
    interaction: TAutocompleteInteraction,
): Promise<Awaited<ReturnType<TBuiltCommandAutocompleteHandler>> | undefined> {
    const choices = Promise.resolve(autocomplete?.(interaction));
    const timeout = new Promise<undefined>((resolve) => {
        setTimeout(() => resolve(undefined), AUTOCOMPLETE_RESPONSE_TIMEOUT_MS);
    });
    return Promise.race([choices, timeout]);
}

export async function handleAutocompleteInteraction(arg: {
    interaction: TAutocompleteInteraction;
    getAutocompleteHandler: TAutocompleteHandlerGetter<TBuiltCommandAutocompleteHandler>;
}) {
    const autocomplete = arg.getAutocompleteHandler(arg.interaction);
    const choices = await getChoicesBeforeInteractionExpires(autocomplete, arg.interaction);

    try {
        await arg.interaction.respond(choices ?? []);
    } catch (error) {
        // Autocomplete requests can legitimately become stale while the user continues typing.
        if (!isUnknownInteractionError(error)) {
            throw error;
        }
    }
}
