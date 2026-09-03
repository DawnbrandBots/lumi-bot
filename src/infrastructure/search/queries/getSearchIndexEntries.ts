import type { TSearchQueries } from "../../../application/search/queries.types.ts";
import type { TSearchEngineQueryFunction } from "./types.ts";

export const getSearchIndexEntries: TSearchEngineQueryFunction<TSearchQueries["getSearchIndexEntries"]> = (
    { searchEngine },
    { input, limit },
) => searchEngine.search(input, limit);
