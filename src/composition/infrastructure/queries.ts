import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationQueries } from "../../application/queries.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { QUERIES as MIKRO_ORM_QUERIES } from "../../infrastructure/persistence/mikroOrm/queries.ts";
import { QUERIES as SEARCH_ENGINE_QUERIES } from "../../infrastructure/search/queries.ts";
import type { ISearchEngine } from "../../infrastructure/search/types.ts";
import { buildDependentFunctionsRecord } from "../utils/buildDependentFunctionsRecord.ts";

const APPLICATION_QUERIES = {
    search: {
        getBestSearchIndexEntry: SEARCH_ENGINE_QUERIES.getBestSearchIndexEntry,
        getEntityByKindAndId: MIKRO_ORM_QUERIES.getGameDataEntityForSearchResult,
        getSearchIndexEntries: SEARCH_ENGINE_QUERIES.getSearchIndexEntries,
    },
} as const;

export function composeQueries({
    em,
    searchEngine,
}: {
    readonly em: EntityManager;
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
}): TApplicationQueries {
    return {
        search: buildDependentFunctionsRecord({ em, searchEngine }, APPLICATION_QUERIES.search),
    };
}
