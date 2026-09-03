import type { TSearchQueries } from "../../../application/search/queries.types.ts";
import type { TSearchEngineQueryFunction } from "./types.ts";

export const getBestSearchIndexEntry: TSearchEngineQueryFunction<TSearchQueries["getBestSearchIndexEntry"]> = (
    { searchEngine },
    input,
) => searchEngine.searchOne(input);
