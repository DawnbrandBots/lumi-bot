import type { TSearchIndexEntry } from "../../src/domain/search/types.ts";
import type { ISearchEngine } from "../../src/infrastructure/search/engine.ts";

export const EMPTY_SEARCH_ENGINE: ISearchEngine<TSearchIndexEntry> = {
    search: () => [],
    searchOne: () => null,
};
