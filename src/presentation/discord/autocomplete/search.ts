import type { TCommandAutocompleteHandlers } from "../commands/types.ts";
import type { TGetSearchIndexEntries } from "../../../search/infra.types.ts";
import { SEARCH_TERMS_OPTION_NAME } from "../commands/search/constants.ts";
import type { searchCommandCommandRegistrationData } from "../commandRegistrationData/search.ts";

const SEARCH_AUTOCOMPLETE_RESULTS_LIMIT = 5;

export function getSearchAutocomplete(arg: { getSearchIndexEntries: TGetSearchIndexEntries }) {
    return {
        [SEARCH_TERMS_OPTION_NAME]: async (interaction) => {
            const input = interaction.options.getFocused();
            const results = await arg.getSearchIndexEntries({ input, limit: SEARCH_AUTOCOMPLETE_RESULTS_LIMIT });
            return results.map((item) => ({ name: item.name, value: item.name }));
        },
    } satisfies TCommandAutocompleteHandlers<typeof searchCommandCommandRegistrationData>;
}
