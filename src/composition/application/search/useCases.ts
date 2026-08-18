import type { EntityManager } from "@mikro-orm/sqlite";
import type {
    TGetEntitiesForGeneratingSearchAliases,
    TGetEntityByKindAndId,
    TGetSearchIndexEntries,
} from "../../../application/search/ports.ts";
import { resolveSearchInput } from "../../../application/search/resolveSearchInput.ts";
import type { TResolveSearchInput } from "../../../application/search/resolveSearchInput.types.ts";
import { generateSearchIndexEntries } from "../../../application/search/searchAliases.ts";
import type { TSearchKind } from "../../../domain/search/types.ts";
import { searchItemInDb } from "../../../infrastructure/game/persistence/searchItemInDb.ts";
import { FuseSearchEngine } from "../../../infrastructure/search/engine.ts";
import SEARCH_CONFIGS from "../../../infrastructure/search/configs.ts";
import { getEntitiesForGeneratingSearchAliases } from "../../../infrastructure/search/getEntitiesForGeneratingSearchAliases.ts";

export type TSearchUseCases = {
    readonly getSearchIndexEntries: TGetSearchIndexEntries;
    readonly resolveSearchInput: TResolveSearchInput;
};

export async function composeSearchUseCases(arg: { readonly em: EntityManager }): Promise<TSearchUseCases> {
    const getSearchAliasEntities: TGetEntitiesForGeneratingSearchAliases = () =>
        getEntitiesForGeneratingSearchAliases({ em: arg.em });
    const searchItems = generateSearchIndexEntries(await getSearchAliasEntities());
    const searchEngine = new FuseSearchEngine({ items: searchItems });
    const getBestSearchIndexEntry = searchEngine.searchOne.bind(searchEngine);
    const getSearchIndexEntries: TGetSearchIndexEntries = (searchArg) =>
        searchEngine.search(searchArg.input, searchArg.limit);
    const getEntityByKindAndId: TGetEntityByKindAndId = <Kind extends TSearchKind>(searchArg: {
        kind: Kind;
        id: string;
    }) => searchItemInDb<Kind>({ configs: SEARCH_CONFIGS, em: arg.em }, searchArg);

    return {
        getSearchIndexEntries,
        resolveSearchInput: (input) => resolveSearchInput({ getBestSearchIndexEntry, getEntityByKindAndId }, input),
    };
}
