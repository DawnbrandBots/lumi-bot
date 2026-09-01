import type { EntityManager } from "@mikro-orm/sqlite";
import type { TSearchIndexEntry } from "../domain/search/types.ts";
import type { ISearchEngine } from "../infrastructure/search/engine.ts";
import type { TBuildableFunctionMiddleware } from "./utils/proxify.ts";
import getWithinTransaction from "./infrastructure/mikroOrm/withinTransaction.ts";
import { composePersistence } from "./infrastructure/persistence.ts";

export function composeInfrastructure({
    em,
    searchEngine,
}: {
    readonly em: EntityManager;
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
}): {
    readonly persistence: ReturnType<typeof composePersistence>;
    readonly withinTransaction: TBuildableFunctionMiddleware;
} {
    return {
        persistence: composePersistence({ em, searchEngine }),
        withinTransaction: getWithinTransaction(em),
    };
}
