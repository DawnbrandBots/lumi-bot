import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationPersistence } from "../../application/persistence.types.ts";
import type { TSearchPersistence } from "../../application/search/persistence.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import ADMIN_REPOSITORIES from "../../infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "../../infrastructure/database/mikroOrm/repositories/lfg.ts";
import { getGameDataEntityForSearchResult } from "../../infrastructure/queries/getGameDataEntityForSearchResult.ts";
import { QUERIES } from "../../infrastructure/queries.ts";
import type { ISearchEngine } from "../../infrastructure/wrappers/searchEngine/types.ts";
import { build } from "../utils/proxify.ts";

export type TComposePersistenceArgument = {
    readonly em: EntityManager;
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
};

const REPOSITORIES = {
    // TODO: might be better if repositories are organized by aggregate instead of "feature"
    admin: ADMIN_REPOSITORIES,
    lfg: LFG_REPOSITORIES,
} as const;

// TODO: some funky business going on for this repository
function composeSearchPersistence(dependencies: TComposePersistenceArgument): TSearchPersistence {
    return {
        getBestSearchIndexEntry: (input) => QUERIES.getBestSearchIndexEntry(dependencies, input),
        getEntityByKindAndId: (arg) => getGameDataEntityForSearchResult(dependencies, arg),
        getSearchIndexEntries: (arg) => QUERIES.getSearchIndexEntries(dependencies, arg),
    };
}

export function composePersistence(dependencies: TComposePersistenceArgument): TApplicationPersistence {
    return {
        admin: build(dependencies, REPOSITORIES.admin),
        lfg: build(dependencies, REPOSITORIES.lfg),
        search: composeSearchPersistence(dependencies),
    };
}
