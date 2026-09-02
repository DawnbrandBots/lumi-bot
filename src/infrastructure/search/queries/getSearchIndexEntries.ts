import type { TGetSearchIndexEntries } from "../../../application/search/queries.types.ts";
import type { TSearchEngineQueryFunction } from "./types.ts";

export const getSearchIndexEntries: TSearchEngineQueryFunction<TGetSearchIndexEntries> = (
    { searchEngine },
    { input, limit },
) => searchEngine.search(input, limit);
