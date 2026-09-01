import type { TGetBestSearchIndexEntry, TGetSearchIndexEntries } from "../../application/search/persistence.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import type { ISearchEngine } from "./engine.ts";

export type TSearchEnginePersistenceDependencies = {
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
};

type TSearchEnginePersistenceFunction<Function extends (...args: never[]) => unknown> = (
    dependencies: TSearchEnginePersistenceDependencies,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;

export const getBestSearchIndexEntry: TSearchEnginePersistenceFunction<TGetBestSearchIndexEntry> = (
    { searchEngine },
    input,
) => searchEngine.searchOne(input);

export const getSearchIndexEntries: TSearchEnginePersistenceFunction<TGetSearchIndexEntries> = (
    { searchEngine },
    { input, limit },
) => searchEngine.search(input, limit);

export const SEARCH_ENGINE_PERSISTENCE = {
    getBestSearchIndexEntry,
    getSearchIndexEntries,
} as const;
