import type { EntityName, Populate } from "@mikro-orm/core";
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
    readonly aliases: string[];
}

export type SearchHandlerResponseReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type SearchFeatureReturnType = IFeatureResponse;

// TODO: "response" argument type should be refined to take populate's type into account
// (to account for potentially not loaded and therefore missing properties that regular typescript types don't see)
export interface ISearchHandler<EntityType extends ISearchableEntity, PopulateHint extends string = never> {
    class: EntityName<EntityType>;
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

export type ISearchHandlers<Items extends ISearchableEntity> = {
    [Kind in Items["kind"]]: ISearchHandler<Items & { kind: Kind }, string>;
};

export interface ISearchEngine<Items extends ISearchItem> {
    searchOne(input: string): Items | undefined;
}

export type TSearchableEntity = Disciple | Weapon | WeaponSkill | Spell;
