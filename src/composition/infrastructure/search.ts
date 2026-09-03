import type { EntityManager } from "@mikro-orm/sqlite";
import { generateSearchIndexEntries } from "../../application/search/searchAliases.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { QUERIES as MIKRO_ORM_QUERIES } from "../../infrastructure/persistence/mikroOrm/queries.ts";
import { FuseSearchEngine } from "../../infrastructure/search/fuse/engine.ts";
import type { ISearchEngine } from "../../infrastructure/search/types.ts";

export async function createSearchEngine({
    em,
}: {
    readonly em: EntityManager;
}): Promise<ISearchEngine<TSearchIndexEntry>> {
    const entitiesForGeneratingSearchAliases = await MIKRO_ORM_QUERIES.getEntitiesForGeneratingSearchAliases({ em });
    const searchItems = generateSearchIndexEntries(entitiesForGeneratingSearchAliases);
    return new FuseSearchEngine({ items: searchItems });
}
