import type { EntityName, Populate } from "@mikro-orm/core";
import type { ISearchableEntity, TSearchKind } from "../../../../../domain/search/types.ts";
import type { TSearchOrmEntity } from "./types.ts";

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
