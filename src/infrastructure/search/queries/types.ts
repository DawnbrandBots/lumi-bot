import type { TSearchIndexEntry } from "../../../domain/search/types.ts";
import type { ISearchEngine } from "../types.ts";

export type TSearchEngineQueryDependencies = {
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
};
export type TSearchEngineQueryFunction<Function extends (...args: never[]) => unknown> = (
    dependencies: TSearchEngineQueryDependencies,
    arg: Parameters<Function>[0],
) => ReturnType<Function>;
