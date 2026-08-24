import type { TSearchPersistence } from "../../../../application/search/persistence.types.ts";
import { getEntitiesForGeneratingSearchAliases } from "./search/getEntitiesForGeneratingSearchAliases.ts";
import { getGameDataEntityForSearchResult } from "./search/getGameDataEntityForSearchResult.ts";
import type { TSearchPersistenceFunction } from "./search/types.ts";

export const SEARCH_REPOSITORIES: {
    readonly [Key in "getEntityByKindAndId"]: TSearchPersistenceFunction<TSearchPersistence[Key]>;
} = {
    getEntityByKindAndId: getGameDataEntityForSearchResult,
};

export const SEARCH_ALIAS_REPOSITORIES = {
    getEntitiesForGeneratingSearchAliases,
};

export default SEARCH_REPOSITORIES;
