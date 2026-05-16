import type { EntityName, Populate } from "@mikro-orm/sqlite";
import type { APIEmbed } from "discord.js";
import type { IFeatureResponse } from "../bot/types.ts";
import type { Disciple } from "../game/models/disciple.ts";
import type { Spell } from "../game/models/spell.ts";
import type { Weapon } from "../game/models/weapon.ts";
import type { WeaponSkill } from "../game/models/weaponSkill.ts";
import type { TId } from "../game/types.ts";

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
    /**
     * All searchable strings that refer to the same item.
     * Eg. "Dark Crossfire Plus Tome" and "DCFPT" both refer to the "Dark Crossfire + 📕" spell.
     */
    readonly aliases: string[];
}

export type SearchHandlerResponseReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type SearchFeatureReturnType = IFeatureResponse;

/**
 * Defines what ORM entity should be searched for and what response should be generated
 * given
 */
// TODO: "response" argument type should be refined to take populate's type into account
// (to account for potentially not loaded and therefore missing properties that regular typescript types don't see)
export interface ISearchHandler<EntityType extends ISearchableEntity, PopulateHint extends string = never> {
    /**
     * ORM entity class required to search for an entry.
     */
    class: EntityName<EntityType>;
    /**
     * Given the ORM entity, returns the formatted response to be sent to the client.
     */
    response: (entity: EntityType) => SearchHandlerResponseReturnType;
    /**
     * MikroORM populate paths for fetched entities.
     * Search handlers might need deeply nested properties that need to be referred to explicitly
     * because just using ["*"] won't populate them.
     *
     * Example: Weapon's search handler displaying the unique skill's effect description.
     * That's a property twice nested that needs to be explictly populated with ["uniqueSkill.effect"]
     */
    populate?: Populate<EntityType, PopulateHint>;
    // TODO: ideally, this file should be void of any mention to MikroORM, in case there's ever a switch to a different method to read the DB
}

/**
 * Associates a {@link ISearchHandler} to each searchable entity.
 */
export type ISearchHandlers<Items extends ISearchableEntity> = {
    [Kind in Items["kind"]]: ISearchHandler<Items & { kind: Kind }, string>;
};

/**
 * Handles user text searches.
 */
export interface ISearchEngine<Items extends ISearchItem> {
    /**
     * May return a searchable item when provided with user input.
     */
    searchOne(userInput: string): Items | undefined;
}

/**
 * All entities which can be retrieved by the search feature at the moment.
 */
export type TSearchableEntity = Disciple | Weapon | WeaponSkill | Spell;
