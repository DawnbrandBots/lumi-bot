import type { APIEmbed } from "discord.js";
import { createErrorMessage, createNegativeMessage, createPositiveMessage } from "../bot/message.ts";
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
import type searchFeature from "./feature.ts";
import SEARCH_MAPPERS, { type ISearchMapper } from "./mappers/index.ts";
import type { TSearchableEntity } from "./types.ts";
import { ESearchFeatureReturnKind } from "./types.ts";

function mapSearchFeatureReturnToMessage<Items extends TSearchableEntity>(
    result: Awaited<ReturnType<typeof searchFeature<Items>>>,
) {
    switch (result.kind) {
        case ESearchFeatureReturnKind.SUCCESS: {
            const { entity, searchItem } = result.value;
            const mapper = SEARCH_MAPPERS[searchItem.kind] as unknown as ISearchMapper<typeof entity>;
            const footer: APIEmbed["footer"] =
                // Showing aliases when there is only one is redundant.
                searchItem.aliases.length > 1
                    ? {
                          text: `${SEARCH_ALIASES_FOOTER_PREFIX} ${searchItem.aliases.join(", ")}`,
                      }
                    : undefined;

            return createPositiveMessage({ embed: { ...mapper(entity), footer } });
        }
        case ESearchFeatureReturnKind.INPUT_TOO_LONG:
            return createNegativeMessage({
                embed: {
                    title: INVALID_INPUT_TITLE,
                    description: INPUT_TOO_LONG_DESCRIPTION,
                },
            });
        case ESearchFeatureReturnKind.NO_RESULT:
            return createNegativeMessage({
                embed: {
                    title: INPUT_TITLE,
                    description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
                },
            });
        case ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB:
            return createErrorMessage({
                embed: {
                    title: MISSING_DATABASE_RESULT_TITLE,
                    fields: [
                        { name: ENTITY_KIND_FIELD_NAME, value: result.value.kind, inline: true },
                        { name: ID_FIELD_NAME, value: result.value.id, inline: true },
                    ],
                },
            });
    }
}

export default mapSearchFeatureReturnToMessage;
