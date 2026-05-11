import Fuse from "fuse.js/basic";

import { EntityManager, EntityName, Populate } from "@mikro-orm/core";
import { APIEmbed } from "discord.js";
import {
    DISCORD_MESSAGE_ERROR_COLOR,
    DISCORD_MESSAGE_SUCCESS_COLOR,
    NOTABOT_DISCORD_MENTION,
    SEARCH_MAX_INPUT_LENGTH,
} from "../models/discord/constants.ts";
import { TId } from "../models/game/types.ts";

export interface ISearchItem {
    readonly kind: string;
    readonly id: TId;
    readonly name: string;
}

export type SearchHandlerResponseReturnType = Required<Pick<APIEmbed, "title" | "fields">>;
export type SearchFeatureReturnType = Required<Pick<APIEmbed, "title" | "color">> &
    Pick<APIEmbed, "fields" | "description">;

// TODO: "response" argument type should be refined to take populate's type into account
// (to account for potentially not loaded and therefore missing properties that regular typescript types don't see)
export type SearchHandler<EntityType extends ISearchItem, PopulateHint extends string = never> = {
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

export type SearchHandlers<Items extends ISearchItem> = {
    [Kind in Items["kind"]]: SearchHandler<Items & { kind: Kind }, string>;
};

async function searchFeature<
    Items extends ISearchItem & { kind: Kinds },
    // TODO: I am not sure why result.item.kind cannot index handlers without specifying this second type argument
    Kinds extends ISearchItem["kind"] = ISearchItem["kind"],
>({
    input,
    fuse,
    handlers,
    em,
}: {
    input: string;
    fuse: Fuse<Items>;
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

    const results = fuse.search(input, { limit: 1 });
    const result = results[0];

    if (!result) {
        return {
            title: "Search yield no result",
            color: DISCORD_MESSAGE_ERROR_COLOR,
        };
    }

    const handler = handlers[result.item.kind];

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(handler.class, { id: result.item.id } as never, {
        populate: (handler.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return {
            title: "Result found in search engine but not in database",
            description: NOTABOT_DISCORD_MENTION,
            fields: [
                { name: "Entity kind", value: result.item.kind, inline: true },
                { name: "Id", value: result.item.id, inline: true },
            ],
            color: DISCORD_MESSAGE_ERROR_COLOR,
        };
    }
    return { ...handler.response(entity), color: DISCORD_MESSAGE_SUCCESS_COLOR };
}

export default searchFeature;
