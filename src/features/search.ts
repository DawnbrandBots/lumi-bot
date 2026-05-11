import { EntityManager, EntityName, Populate } from "@mikro-orm/core";
import { APIEmbed } from "discord.js";
import type { ISearchEngine } from "../loaders/searchEngine.ts";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_SUCCESS_COLOR,
    NOTABOT_DISCORD_MENTION,
    SEARCH_MAX_INPUT_LENGTH,
} from "../models/discord/constants.ts";
import { TId } from "../models/game/types.ts";

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
    readonly kind: string;
    readonly id: TId;
    /**
     * All searchable terms associated with the entity.
     */
    readonly aliases: string[];
}

export type SearchHandlerResponseReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type SearchFeatureReturnType = Required<Pick<APIEmbed, "title" | "color">> &
    Pick<APIEmbed, "fields" | "description">;

// TODO: "response" argument type should be refined to take populate's type into account
// (to account for potentially not loaded and therefore missing properties that regular typescript types don't see)
export type SearchHandler<EntityType extends ISearchableEntity, PopulateHint extends string = never> = {
    class: EntityName<EntityType>;
    response: (item: EntityType) => SearchHandlerResponseReturnType;
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
};

export type SearchHandlers<Items extends ISearchableEntity> = {
    [Kind in Items["kind"]]: SearchHandler<Items & { kind: Kind }, string>;
};

async function searchFeature<
    Items extends ISearchableEntity & { kind: Kinds },
    // TODO: I am not sure why result.item.kind cannot index handlers without specifying this second type argument
    Kinds extends ISearchableEntity["kind"] = ISearchableEntity["kind"],
>({
    input,
    searchEngine,
    handlers,
    em,
}: {
    input: string;
    searchEngine: ISearchEngine<ISearchItem & { kind: Kinds }>;
    handlers: SearchHandlers<Items>;
    em: EntityManager;
}): Promise<SearchFeatureReturnType> {
    if (input.length > SEARCH_MAX_INPUT_LENGTH) {
        return {
            title: "Input",
            color: DISCORD_MESSAGE_ERROR_COLOR,
            description: `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`,
        };
    }

    const item = searchEngine.searchOne(input);

    if (!item) {
        return {
            title: "Search yield no result",
            color: DISCORD_MESSAGE_ERROR_COLOR,
        };
    }

    const handler = handlers[item.kind];

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(handler.class, { id: item.id } as never, {
        populate: (handler.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return {
            title: "Result found in search engine but not in database",
            description: NOTABOT_DISCORD_MENTION,
            fields: [
                { name: "Entity kind", value: item.kind, inline: true },
                { name: "Id", value: item.id, inline: true },
            ],
            color: DISCORD_MESSAGE_ERROR_COLOR,
        };
    }
    return { ...handler.response(entity), color: DISCORD_MESSAGE_SUCCESS_COLOR };
}

export default searchFeature;
