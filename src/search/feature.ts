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

function mapEntityToSearchFeatureReturnValue<Kind extends TSearchKind>({
    entity,
    searchItem,
}: {
    entity: TSearchEntity<Kind> | null;
    searchItem: TSearchItem<Kind>;
}): TSearchFeatureReturn<Kind> & {
    readonly kind: ESearchFeatureReturnKind.SUCCESS | ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB;
} {
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

function getFromEntityManager<Kind extends TSearchKind>({
    em,
    config,
    query,
}: {
    em: EntityManager;
    config: ISearchConfigs[Kind];
    query: FilterQuery<TSearchEntity<Kind>>;
}): Promise<TSearchEntity<Kind> | null> {
    return em.findOne(config.class, query, {
        populate: (config.populate ?? ["*"]) as never,
    });
}

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
    // TODO: figure out the correct types here
    const config = configs[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchEntity<Kind>>;
    const entity = await getFromEntityManager({ em, config, query });
    return mapEntityToSearchFeatureReturnValue({ entity, searchItem });
}

type SearchFeatureProps = {
    searchEngine: ISearchEngine<TSearchItem>;
    configs: ISearchConfigs;
    em: EntityManager;
};

async function searchFeature(arg: { props: SearchFeatureProps; input: string }): Promise<TSearchFeatureReturn> {
    if (arg.input.length > SEARCH_MAX_INPUT_LENGTH) {
        return { kind: ESearchFeatureReturnKind.INPUT_TOO_LONG } as const;
    }

    const searchItem = arg.props.searchEngine.searchOne(arg.input);

    if (!searchItem) {
        return { kind: ESearchFeatureReturnKind.NO_RESULT } as const;
    }

    return searchItemInDb({ configs: arg.props.configs, em: arg.props.em, searchItem });
}

function getSearchFeature(props: SearchFeatureProps) {
    return (input: string) => searchFeature({ props, input });
}

export default getSearchFeature;
