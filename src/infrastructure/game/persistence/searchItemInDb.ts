import type { EntityManager, FilterQuery } from "@mikro-orm/sqlite";
import type { TSearchKind } from "../../../domain/search/types.ts";
import type { ISearchConfigs, TSearchOrmEntity } from "../../search/types.ts";

function getFromEntityManager<Kind extends TSearchKind>({
    em,
    config,
    query,
}: {
    em: EntityManager;
    config: ISearchConfigs[Kind];
    query: FilterQuery<TSearchOrmEntity<Kind>>;
}): Promise<TSearchOrmEntity<Kind> | null> {
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
    const query = { id: searchItem.id } as FilterQuery<TSearchOrmEntity<Kind>>;
    return getFromEntityManager({ em, config, query });
}
