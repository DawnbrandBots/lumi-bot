import type { TServiceBase } from "../types.ts";

const SEARCH_AUTOCOMPLETE_RESULTS_LIMIT = 5;

export const autocompleteSearchTerms: TServiceBase<"autocompleteSearchTerms", "useCases.search.suggestSearchResults"> =
    async function ({ useCases }, interaction) {
        const input = interaction.options.getFocused();
        const results = await useCases.search.suggestSearchResults({ input, limit: SEARCH_AUTOCOMPLETE_RESULTS_LIMIT });
        return results.map((item) => ({ name: item.name, value: item.name }));
    };

export default autocompleteSearchTerms;
