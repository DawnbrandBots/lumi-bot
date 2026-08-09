import type { EntityName, Populate } from "@mikro-orm/sqlite";
import type { ISearchableEntity, TSearchKind } from "../../domain/search/types.ts";
import type { Disciple } from "../game/models/disciple.ts";
import type { Music } from "../game/models/music.ts";
import type { Spell } from "../game/models/spell.ts";
import type { Weapon } from "../game/models/weapon.ts";
import type { WeaponSkill } from "../game/models/weaponSkill.ts";

export type TSearchableOrmEntity = Disciple | Weapon | WeaponSkill | Spell | Music;
export type TSearchOrmEntityMap = { [Entity in TSearchableOrmEntity as Entity["kind"]]: Entity };
export type TSearchOrmEntity<Kind extends TSearchKind> = TSearchOrmEntityMap[Kind];

/**
 * Defines what ORM entity should be searched for.
 */
export interface ISearchConfig<EntityType extends ISearchableEntity, PopulateHint extends string = never> {
    /**
     * ORM entity class required to search for an entry.
     */
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

/**
 * Associates a {@link ISearchConfig} to each searchable entity.
 */
export type ISearchConfigs = {
    [Kind in TSearchKind]: ISearchConfig<TSearchOrmEntity<Kind>, string>;
};
