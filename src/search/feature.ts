import type { EntityManager, FilterQuery } from "@mikro-orm/sqlite";
import { SEARCH_MAX_INPUT_LENGTH } from "../bot/constants.ts";
import type {
    ISearchConfigs,
    ISearchEngine,
    TSearchEntity,
    TSearchFeatureReturn,
    TSearchItem,
    TSearchKind,
} from "./types.ts";
import { ESearchFeatureReturnKind } from "./types.ts";

async function searchItemInDb<Kind extends TSearchKind>({
    configs,
    em,
    searchItem,
}: {
    configs: ISearchConfigs;
    em: EntityManager;
    searchItem: TSearchItem<Kind>;
}): Promise<
    TSearchFeatureReturn<Kind> & {
        kind: ESearchFeatureReturnKind.SUCCESS | ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB;
    }
> {
    const config = configs[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchEntity<Kind>>;
    const entity = await em.findOne(config.class, query, {
        populate: (config.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return {
            kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            value: { kind: searchItem.kind, id: searchItem.id },
        };
    }
    return {
        kind: ESearchFeatureReturnKind.SUCCESS,
        value: { kind: searchItem.kind, entity, searchItem },
    };
}

async function searchFeature({
    input,
    searchEngine,
    configs,
    em,
}: {
    input: string;
    searchEngine: ISearchEngine<TSearchItem>;
    configs: ISearchConfigs;
    em: EntityManager;
}): Promise<TSearchFeatureReturn> {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchFeatureReturnKind.INPUT_TOO_LONG } as const;
    }

    const searchItem = searchEngine.searchOne(input);

    if (!searchItem) {
        return { kind: ESearchFeatureReturnKind.NO_RESULT } as const;
    }

    return searchItemInDb({ configs, em, searchItem });
}

export default searchFeature;
