import { getEntitiesForGeneratingSearchAliases } from "./queries/getEntitiesForGeneratingSearchAliases.ts";
import { getGameDataEntityForSearchResult } from "./queries/getGameDataEntityForSearchResult.ts";

export const QUERIES = {
    getEntitiesForGeneratingSearchAliases,
    getGameDataEntityForSearchResult,
} as const;
