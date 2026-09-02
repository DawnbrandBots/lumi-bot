import type { EntityManager } from "@mikro-orm/sqlite";
import type { TSearchIndexEntry } from "../domain/search/types.ts";
import type { ISearchEngine } from "../infrastructure/search/types.ts";
import getWithinTransaction from "./infrastructure/mikroOrm/withinTransaction.ts";
import { composeQueries } from "./infrastructure/queries.ts";
import { composeRepositories } from "./infrastructure/repositories.ts";
import type { TBuildableFunctionMiddleware } from "./utils/proxify.ts";

export function composeInfrastructure({
    em,
    searchEngine,
}: {
    readonly em: EntityManager;
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
}): {
    readonly queries: ReturnType<typeof composeQueries>;
    readonly repositories: ReturnType<typeof composeRepositories>;
    readonly withinTransaction: TBuildableFunctionMiddleware;
} {
    return {
        queries: composeQueries({ em, searchEngine }),
        repositories: composeRepositories({ em }),
        withinTransaction: getWithinTransaction(em),
    };
}
