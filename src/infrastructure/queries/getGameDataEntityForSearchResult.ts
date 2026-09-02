import type { EntityManager, EntityName, FilterQuery, Populate } from "@mikro-orm/sqlite";
import type { ISearchableEntity, TSearchKind } from "../../domain/search/types.ts";
import { Disciple } from "../database/mikroOrm/models/game/disciple.ts";
import { Music } from "../database/mikroOrm/models/game/music.ts";
import { Spell } from "../database/mikroOrm/models/game/spell.ts";
import { Weapon } from "../database/mikroOrm/models/game/weapon.ts";
import { WeaponSkill } from "../database/mikroOrm/models/game/weaponSkill.ts";
import type { TSearchOrmEntity } from "../database/mikroOrm/repositories/search/types.ts";

/** Defines what ORM entity should be searched for. */
export interface ISearchConfig<EntityType extends ISearchableEntity, PopulateHint extends string = never> {
    /** ORM entity class required to search for an entry. */
    class: EntityName<EntityType>;
    /**
     * MikroORM populate paths for fetched entities.
     * Search mappers might need deeply nested properties that need to be referred to explicitly
     * because just using ["*"] won't populate them.
     *
     * Example: Weapon's search handler displaying the unique skill's effect description.
     * That's a property twice nested that needs to be explictly populated with ["uniqueSkill.effect"]
     */
    populate?: Populate<EntityType, PopulateHint>;
}

/** Associates a {@link ISearchConfig} to each searchable entity. */
export type ISearchConfigs = {
    [Kind in TSearchKind]: ISearchConfig<TSearchOrmEntity<Kind>, string>;
};

const spellPopulate = ["*"] as const;
const weaponPopulate = ["weaponType", "weaponType.weaponSkills.effect", "uniqueSkill.effect", "prfDisciple"] as const;

const SEARCH_CONFIGS = {
    disciple: { class: Disciple } as const satisfies ISearchConfig<Disciple>,
    music: { class: Music } as const satisfies ISearchConfig<Music>,
    spell: { class: Spell, populate: spellPopulate } as const satisfies ISearchConfig<
        Spell,
        (typeof spellPopulate)[number]
    >,
    // Awkward but TypeScript rejects `as const satifies ISearchConfig<Weapon, (typeof weaponPopulate)[number]>` for this one and I don't undertsand why
    weapon: ((): ISearchConfig<Weapon, (typeof weaponPopulate)[number]> => ({
        class: Weapon,
        populate: weaponPopulate,
    }))(),
    weaponSkill: { class: WeaponSkill } as const satisfies ISearchConfig<WeaponSkill>,
} as const satisfies ISearchConfigs;

function getFromEntityManager<Kind extends TSearchKind>(arg: {
    em: EntityManager;
    config: ISearchConfigs[Kind];
    query: FilterQuery<TSearchOrmEntity<Kind>>;
}): Promise<TSearchOrmEntity<Kind> | null> {
    return arg.em.findOne(arg.config.class, arg.query, {
        populate: (arg.config.populate ?? ["*"]) as never,
    });
}

export async function getGameDataEntityForSearchResult<Kind extends TSearchKind>(
    { em }: { em: EntityManager },
    searchItem: { kind: Kind; id: string },
) {
    // TODO: figure out the correct types here
    const config = SEARCH_CONFIGS[searchItem.kind];
    const query = { id: searchItem.id } as FilterQuery<TSearchOrmEntity<Kind>>;
    return getFromEntityManager({ em, config, query });
}
