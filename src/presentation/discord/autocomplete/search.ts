import type { TCommandAutocompleteHandlers } from "../../../bot/commands/types.ts";
import { SEARCH_AUTOCOMPLETE_RESULTS_LIMIT, SEARCH_TERMS_OPTION_NAME } from "../../../search/constants.ts";
import type { TGetSearchIndexEntries } from "../../../search/infra.types.ts";
import type { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";

export function getSearchAutocomplete(arg: { getSearchIndexEntries: TGetSearchIndexEntries }) {
    return {
        [SEARCH_TERMS_OPTION_NAME]: async (interaction) => {
            const input = interaction.options.getFocused();
            const results = await arg.getSearchIndexEntries({ input, limit: SEARCH_AUTOCOMPLETE_RESULTS_LIMIT });
            return results.map((item) => ({ name: item.name, value: item.name }));
        },
    } satisfies TCommandAutocompleteHandlers<typeof searchCommandCommandRegistrationData>;
}
