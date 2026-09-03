import type { EntityManager } from "@mikro-orm/sqlite";
import { generateSearchIndexEntries } from "../../application/search/searchAliases.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../infrastructure/persistence/mikroOrm/queries/getEntitiesForGeneratingSearchAliases.ts";
import { FuseSearchEngine } from "../../infrastructure/search/fuse/engine.ts";
import type { ISearchEngine } from "../../infrastructure/search/types.ts";

export async function createSearchEngine({
    em,
}: {
    readonly em: EntityManager;
}): Promise<ISearchEngine<TSearchIndexEntry>> {
    const entitiesForGeneratingSearchAliases = await getEntitiesForGeneratingSearchAliases({ em });
    const searchItems = generateSearchIndexEntries(entitiesForGeneratingSearchAliases);
    return new FuseSearchEngine({ items: searchItems });
}
