import type { TGetBestSearchIndexEntry } from "../../../application/search/persistence.types.ts";
import type { TSearchEnginePersistenceFunction } from "./types.ts";

export const getBestSearchIndexEntry: TSearchEnginePersistenceFunction<TGetBestSearchIndexEntry> = (
    { searchEngine },
    input,
) => searchEngine.searchOne(input);
