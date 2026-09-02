import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationPersistence } from "../../application/persistence.types.ts";
import type { TSearchPersistence } from "../../application/search/persistence.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import ADMIN_REPOSITORIES from "../../infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "../../infrastructure/database/mikroOrm/repositories/lfg.ts";
import { getGameDataEntityForSearchResult } from "../../infrastructure/database/mikroOrm/repositories/search/getGameDataEntityForSearchResult.ts";
import type { ISearchEngine } from "../../infrastructure/search/engine.types.ts";
import { SEARCH_ENGINE_PERSISTENCE } from "../../infrastructure/search/persistence.ts";
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
        getBestSearchIndexEntry: (input) => SEARCH_ENGINE_PERSISTENCE.getBestSearchIndexEntry(dependencies, input),
        getEntityByKindAndId: (arg) => getGameDataEntityForSearchResult(dependencies, arg),
        getSearchIndexEntries: (arg) => SEARCH_ENGINE_PERSISTENCE.getSearchIndexEntries(dependencies, arg),
    };
}

export function composePersistence(dependencies: TComposePersistenceArgument): TApplicationPersistence {
    return {
        admin: build(dependencies, REPOSITORIES.admin),
        lfg: build(dependencies, REPOSITORIES.lfg),
        search: composeSearchPersistence(dependencies),
    };
}
