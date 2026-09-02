import type { TGetSearchIndexEntries } from "../../application/search/persistence.types.ts";
import type { TSearchEnginePersistenceFunction } from "./types.ts";

export const getSearchIndexEntries: TSearchEnginePersistenceFunction<TGetSearchIndexEntries> = (
    { searchEngine },
    { input, limit },
) => searchEngine.search(input, limit);
