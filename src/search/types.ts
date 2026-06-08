import type { EntityName, Populate } from "@mikro-orm/sqlite";
import type { Disciple } from "../game/models/disciple.ts";
import type { Spell } from "../game/models/spell.ts";
import type { Weapon } from "../game/models/weapon.ts";
import type { WeaponSkill } from "../game/models/weaponSkill.ts";
import type { TId } from "../game/types.ts";

export interface ISearchEntityMap {
    disciple: Disciple;
    weapon: Weapon;
    weaponSkill: WeaponSkill;
    spell: Spell;
}

export type TSearchKind = keyof ISearchEntityMap;
export type TSearchEntity<Kind extends TSearchKind> = ISearchEntityMap[Kind] & ISearchableEntity;
export type TSearchableEntity = TSearchEntity<TSearchKind>;

/**
 * Properties required for entities to be searchable.
 */
export interface ISearchableEntity {
    readonly id: TId;
    readonly kind: string;
    readonly name: string;
}

/**
 * Properties of objects stored and retrieved by the search engine.
 */
export interface ISearchItem {
    readonly id: TId;
    readonly kind: string;
    readonly name: string;
    /**
     * All searchable strings that refer to the same item.
     * Eg. "Dark Crossfire Plus Tome" and "DCFPT" both refer to the "Dark Crossfire + 📕" spell.
     */
    readonly aliases: string[];
}

export type TSearchItem<Kind extends TSearchKind = TSearchKind> = {
    [K in Kind]: ISearchItem & { kind: K };
}[Kind];

export const enum ESearchFeatureReturnKind {
    SUCCESS = "SUCCESS",
    INPUT_TOO_LONG = "INPUT_TOO_LONG",
    NO_RESULT = "NO_RESULT",
    FOUND_BY_ENGINE_BUT_NOT_BY_DB = "FOUND_BY_ENGINE_BUT_NOT_BY_DB",
}

export type TSearchFeatureSuccessValue<Kind extends TSearchKind> = {
    readonly kind: Kind;
    readonly entity: TSearchEntity<Kind>;
    readonly searchItem: TSearchItem<Kind>;
};

export type TSearchFeatureSuccess<Kind extends TSearchKind = TSearchKind> = {
    readonly kind: ESearchFeatureReturnKind.SUCCESS;
    readonly value: TSearchFeatureSuccessValue<Kind>;
};

export type TSearchFeatureReturn<Kind extends TSearchKind = TSearchKind> =
    | TSearchFeatureSuccess<Kind>
    | { readonly kind: ESearchFeatureReturnKind.INPUT_TOO_LONG }
    | { readonly kind: ESearchFeatureReturnKind.NO_RESULT }
    | {
        readonly kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB;
        readonly value: {
            readonly kind: Kind;
            readonly id: TId;
        };
    };

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
    // TODO: ideally, this file should be void of any mention to MikroORM, in case there's ever a switch to a different method to read the DB
}

/**
 * Associates a {@link ISearchConfig} to each searchable entity.
 */
export type ISearchConfigs = {
    [Kind in TSearchKind]: ISearchConfig<TSearchEntity<Kind>, string>;
};

/**
 * Handles user text searches.
 */
export interface ISearchEngine<Items extends ISearchItem> {
    /**
     * May return a searchable item when provided with user input.
     */
    searchOne(userInput: string): Items | undefined;
    /**
     * Returns an array of searchable items matching the user input.
     */
    search(userInput: string, limit?: number): Items[];
}
