import type { EntityManager } from "@mikro-orm/sqlite";
import type { TGetEntityByKindAndId, TGetSearchIndexEntries } from "../../../application/search/persistence.types.ts";
import { generateSearchIndexEntries } from "../../../application/search/searchAliases.ts";
import type { TSearchUseCases } from "../../../application/search/useCases.types.ts";
import resolveSearchInput from "../../../application/search/useCases/resolveSearchInput.ts";
import suggestSearchResults from "../../../application/search/useCases/suggestSearchResults.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../infrastructure/database/mikroOrm/repositories/search/getEntitiesForGeneratingSearchAliases.ts";
import { getGameDataEntityForSearchResult } from "../../../infrastructure/database/mikroOrm/repositories/search/getGameDataEntityForSearchResult.ts";
import { FuseSearchEngine } from "../../../infrastructure/search/engine.ts";
export type { TSearchUseCases } from "../../../application/search/useCases.types.ts";

export async function composeSearchUseCases(arg: { readonly em: EntityManager }): Promise<TSearchUseCases> {
    const searchItems = generateSearchIndexEntries(await getEntitiesForGeneratingSearchAliases({ em: arg.em }));
    const searchEngine = new FuseSearchEngine({ items: searchItems });
    const getBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
    const getSearchIndexEntries: TGetSearchIndexEntries = (searchArg) =>
        searchEngine.search(searchArg.input, searchArg.limit);
    const getEntityByKindAndId: TGetEntityByKindAndId = (searchArg) =>
        getGameDataEntityForSearchResult({ em: arg.em }, searchArg);

    return {
        resolveSearchInput: (input) => resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input),
        suggestSearchResults: (searchArg) => suggestSearchResults({ getSearchIndexEntries }, searchArg),
    };
}
