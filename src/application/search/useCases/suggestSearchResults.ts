import type { TSearchUseCaseBase } from "../types.ts";

export const suggestSearchResults: TSearchUseCaseBase<"suggestSearchResults", "queries.search.getSearchIndexEntries"> =
    function (dependencies, { input, limit }) {
        return dependencies.queries.search.getSearchIndexEntries({ input, limit });
    };
