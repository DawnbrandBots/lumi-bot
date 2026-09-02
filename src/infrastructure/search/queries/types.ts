import type { TSearchIndexEntry } from "../../../domain/search/types.ts";
import type { ISearchEngine } from "../types.ts";

export type TSearchEnginePersistenceDependencies = {
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
};
export type TSearchEnginePersistenceFunction<Function extends (...args: never[]) => unknown> = (
    dependencies: TSearchEnginePersistenceDependencies,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;
