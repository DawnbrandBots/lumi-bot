import type { EntityManager } from "@mikro-orm/sqlite";
import type { TApplicationQueries } from "../../application/queries.types.ts";
import type { TSearchIndexEntry } from "../../domain/search/types.ts";
import { getGameDataEntityForSearchResult } from "../../infrastructure/persistence/mikroOrm/queries/getGameDataEntityForSearchResult.ts";
import { QUERIES } from "../../infrastructure/search/queries.ts";
import type { ISearchEngine } from "../../infrastructure/search/types.ts";

export function composeQueries({
    em,
    searchEngine,
}: {
    readonly em: EntityManager;
    readonly searchEngine: ISearchEngine<TSearchIndexEntry>;
}): TApplicationQueries {
    return {
        search: {
            getBestSearchIndexEntry: (input) => QUERIES.getBestSearchIndexEntry({ searchEngine }, input),
            // TODO: getGameDataEntityForSearchResult should come from an exported object too?
            getEntityByKindAndId: (arg) => getGameDataEntityForSearchResult({ em }, arg),
            getSearchIndexEntries: (arg) => QUERIES.getSearchIndexEntries({ searchEngine }, arg),
        },
    };
}
