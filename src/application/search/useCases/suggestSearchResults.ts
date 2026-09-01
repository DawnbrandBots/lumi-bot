import type { TSearchUseCaseBase } from "../types.ts";

export const suggestSearchResults: TSearchUseCaseBase<
    "suggestSearchResults",
    "persistence.search.getSearchIndexEntries"
> = function (dependencies, { input, limit }) {
    return dependencies.persistence.search.getSearchIndexEntries({ input, limit });
};
