import type { EntityManager, EntityName, Populate } from "@mikro-orm/core";
import type { APIEmbed } from "discord.js";
import type { ISearchEngine } from "../loaders/searchEngine.ts";
import { SEARCH_MAX_INPUT_LENGTH } from "../models/discord/constants.ts";
import type { TId } from "../models/game/types.ts";
import type { IFeatureResponse } from "./featureResponse.ts";
import { ErrorFeatureResponse, SuccessFeatureResponse } from "./featureResponse.ts";

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

export const INVALID_INPUT_TITLE = "Invalid input";
export const INPUT_TOO_LONG_DESCRIPTION = `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`;
export const INPUT_TITLE = "Input";
export const SEARCH_YIELDED_NO_RESULT_DESCRIPTION = "Search yielded no result";
export const MISSING_DATABASE_RESULT_TITLE = "Result found in search engine but not in database";
export const ENTITY_KIND_FIELD_NAME = "Entity kind";
export const ID_FIELD_NAME = "Id";
export const SEARCH_ALIASES_FOOTER_PREFIX = "Search aliases:";

// TODO: "response" argument type should be refined to take populate's type into account
// (to account for potentially not loaded and therefore missing properties that regular typescript types don't see)
export type SearchHandler<EntityType extends ISearchableEntity, PopulateHint extends string = never> = {
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
        return new ErrorFeatureResponse({
            embed: {
                title: INVALID_INPUT_TITLE,
                description: INPUT_TOO_LONG_DESCRIPTION,
            },
        });
    }

    const searchItem = searchEngine.searchOne(input);

    if (!searchItem) {
        return new ErrorFeatureResponse({
            embed: {
                title: INPUT_TITLE,
                description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
            },
        });
    }

    const handler = handlers[searchItem.kind];

    // TODO: figure out the correct types here and remove as never
    const entity = await em.findOne(handler.class, { id: searchItem.id } as never, {
        populate: (handler.populate ?? ["*"]) as never,
    });
    if (!entity) {
        return new ErrorFeatureResponse({
            embed: {
                title: MISSING_DATABASE_RESULT_TITLE,
                fields: [
                    { name: ENTITY_KIND_FIELD_NAME, value: searchItem.kind, inline: true },
                    { name: ID_FIELD_NAME, value: searchItem.id, inline: true },
                ],
            },
        });
    }

    const footer: APIEmbed["footer"] =
        // Showing aliases when there is only one is redundant.
        searchItem.aliases.length > 1
            ? {
                text: `${SEARCH_ALIASES_FOOTER_PREFIX} ${searchItem.aliases.join(", ")}`,
            }
            : undefined;

    return new SuccessFeatureResponse({ embed: { ...handler.response(entity), footer } });
}

export default searchFeature;
