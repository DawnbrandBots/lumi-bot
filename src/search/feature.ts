import type { EntityManager } from "@mikro-orm/sqlite";
import type { APIEmbed } from "discord.js";
import { SEARCH_MAX_INPUT_LENGTH } from "../bot/constants.ts";
import { ErrorFeatureResponse, SuccessFeatureResponse } from "../bot/featureResponse.ts";
import {
    ENTITY_KIND_FIELD_NAME,
    ID_FIELD_NAME,
    INPUT_TITLE,
    INPUT_TOO_LONG_DESCRIPTION,
    INVALID_INPUT_TITLE,
    MISSING_DATABASE_RESULT_TITLE,
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "./constants.ts";
import type {
    ISearchableEntity,
    ISearchEngine,
    ISearchHandlers,
    ISearchItem,
    SearchFeatureReturnType,
} from "./types.ts";

async function searchFeature<
    Items extends ISearchableEntity & { kind: Kinds },
    Kinds extends ISearchableEntity["kind"] = ISearchableEntity["kind"],
>({
    input,
    searchEngine,
    handlers,
    em,
}: {
    input: string;
    searchEngine: ISearchEngine<ISearchItem & { kind: Kinds }>;
    handlers: ISearchHandlers<Items>;
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
