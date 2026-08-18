import type { EntityManager } from "@mikro-orm/sqlite";
import type {
    TGetEntitiesForGeneratingSearchAliases,
    TGetEntityByKindAndId,
    TGetSearchIndexEntries,
} from "../../../application/search/ports.ts";
import { resolveSearchInput } from "../../../application/search/resolveSearchInput.ts";
import type { TResolveSearchInput } from "../../../application/search/resolveSearchInput.types.ts";
import { generateSearchIndexEntries } from "../../../application/search/searchAliases.ts";
import { suggestSearchResults } from "../../../application/search/suggestSearchResults.ts";
import type { TSuggestSearchResults } from "../../../application/search/suggestSearchResults.types.ts";
import { getGameDataEntityForSearchResult } from "../../../infrastructure/database/mikroOrm/repositories/search/getGameDataEntityForSearchResult.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../infrastructure/database/mikroOrm/repositories/search/getEntitiesForGeneratingSearchAliases.ts";
import { FuseSearchEngine } from "../../../infrastructure/search/engine.ts";

export type TSearchUseCases = {
    readonly resolveSearchInput: TResolveSearchInput;
    readonly suggestSearchResults: TSuggestSearchResults;
};

export async function composeSearchUseCases(arg: { readonly em: EntityManager }): Promise<TSearchUseCases> {
    const getSearchAliasEntities: TGetEntitiesForGeneratingSearchAliases = () =>
        getEntitiesForGeneratingSearchAliases({ em: arg.em });
    const searchItems = generateSearchIndexEntries(await getSearchAliasEntities());
    const searchEngine = new FuseSearchEngine({ items: searchItems });
    const getBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
    const getSearchIndexEntries: TGetSearchIndexEntries = (searchArg) =>
        searchEngine.search(searchArg.input, searchArg.limit);
    const getEntityByKindAndId: TGetEntityByKindAndId = (searchArg) =>
        getGameDataEntityForSearchResult({ em: arg.em }, searchArg);

    return {
        resolveSearchInput: (input) => resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input),
        suggestSearchResults: (searchArg) => suggestSearchResults(getSearchIndexEntries, searchArg),
    };
}
