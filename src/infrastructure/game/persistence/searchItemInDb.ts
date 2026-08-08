import type { EntityManager, FilterQuery } from "@mikro-orm/sqlite";
import type { ISearchConfigs, TSearchEntity, TSearchKind } from "../../../search/types.ts";

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

export async function searchItemInDb<Kind extends TSearchKind>(
    {
        configs,
        em,
    }: {
        configs: ISearchConfigs;
        em: EntityManager;
    },
    searchItem: { kind: Kind; id: string },
) {
    // TODO: figure out the correct types here
    const config = configs[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchEntity<Kind>>;
    return getFromEntityManager({ em, config, query });
}
