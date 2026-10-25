import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationQueries } from "../../application/queries.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { findBazaarDiscipleById } from "../../infrastructure/persistence/mikroOrm/queries/findBazaarDiscipleById.ts";
import { findBazaarWeaponById } from "../../infrastructure/persistence/mikroOrm/queries/findBazaarWeaponById.ts";
import { getGameDataEntityForSearchResult } from "../../infrastructure/persistence/mikroOrm/queries/getGameDataEntityForSearchResult.ts";
import { getBestSearchIndexEntry } from "../../infrastructure/search/queries/getBestSearchIndexEntry.ts";
import { getSearchIndexEntries } from "../../infrastructure/search/queries/getSearchIndexEntries.ts";
import type { ISearchEngine } from "../../infrastructure/search/types.ts";
import { buildDependentFunctionsRecord } from "../utils/buildDependentFunctionsRecord.ts";

const APPLICATION_QUERIES = {
    bazaar: {
        findDiscipleById: findBazaarDiscipleById,
        findWeaponById: findBazaarWeaponById,
    },
    search: {
        getBestSearchIndexEntry,
        getEntityByKindAndId: getGameDataEntityForSearchResult,
        getSearchIndexEntries,
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
        bazaar: buildDependentFunctionsRecord({ em }, APPLICATION_QUERIES.bazaar),
        search: buildDependentFunctionsRecord({ em, searchEngine }, APPLICATION_QUERIES.search),
    };
}
