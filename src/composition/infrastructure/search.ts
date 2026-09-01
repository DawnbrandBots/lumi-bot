import type { EntityManager } from "@mikro-orm/sqlite";
import { generateSearchIndexEntries } from "../../application/search/searchAliases.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../infrastructure/database/mikroOrm/repositories/search/getEntitiesForGeneratingSearchAliases.ts";
import { FuseSearchEngine, type ISearchEngine } from "../../infrastructure/search/engine.ts";

export async function createSearchEngine({
    em,
}: {
    readonly em: EntityManager;
}): Promise<ISearchEngine<TSearchIndexEntry>> {
    // TODO: should be moved to a new infrastructure/database/mikroOrm/queries/ directory
    const entitiesForGeneratingSearchAliases = await getEntitiesForGeneratingSearchAliases({ em });
    const searchItems = generateSearchIndexEntries(entitiesForGeneratingSearchAliases);
    return new FuseSearchEngine({ items: searchItems });
}
