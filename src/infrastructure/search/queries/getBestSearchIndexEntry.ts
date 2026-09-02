import type { TGetBestSearchIndexEntry } from "../../../application/search/queries.types.ts";
import type { TSearchEngineQueryFunction } from "./types.ts";

export const getBestSearchIndexEntry: TSearchEngineQueryFunction<TGetBestSearchIndexEntry> = (
    { searchEngine },
    input,
) => searchEngine.searchOne(input);
