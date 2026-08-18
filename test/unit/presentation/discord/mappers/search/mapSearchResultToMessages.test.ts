import { describe, expect, test } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../../../../src/application/search/constants.ts";
import { ESearchResultKind } from "../../../../../../src/application/search/types.ts";
import { DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT } from "../../../../../../src/presentation/discord/constants.ts";
import mapSearchResultToMessages from "../../../../../../src/presentation/discord/mappers/search.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";
import { MUSIC, MUSIC_SEARCH_SUCCESS_VALUE } from "./root.fixtures.ts";

const SEARCH_ENTITY_KIND_FIELD_NAME = "Entity kind";
const SEARCH_ID_FIELD_NAME = "Id";
const SEARCH_INPUT_TOO_LONG_DESCRIPTION = `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`;
const SEARCH_YIELDED_NO_RESULT_DESCRIPTION = "Search yielded no result";
const SEARCH_MISSING_DATABASE_RESULT_DESCRIPTION = "Result found in search engine but not in database";

describe(mapSearchResultToMessages.name, () => {
    test.each([
        [
            ESearchResultKind.SUCCESS,
            {
                kind: ESearchResultKind.SUCCESS,
                value: MUSIC_SEARCH_SUCCESS_VALUE,
            },
            {
                reply: {
                    kind: EMessageKind.POSITIVE,
                    embeds: [
                        {
                            title: MUSIC.name,
                        },
                    ],
                },
            },
        ],
        [
            ESearchResultKind.INPUT_TOO_LONG,
            {
                kind: ESearchResultKind.INPUT_TOO_LONG,
            },
            {
                reply: {
                    kind: EMessageKind.NEGATIVE,
                    embeds: [
                        {
                            description: SEARCH_INPUT_TOO_LONG_DESCRIPTION,
                        },
                    ],
                },
            },
        ],
        [
            ESearchResultKind.NO_RESULT,
            {
                kind: ESearchResultKind.NO_RESULT,
            },
            {
                reply: {
                    kind: EMessageKind.NEGATIVE,
                    embeds: [
                        {
                            description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
                        },
                    ],
                },
            },
        ],
        [
            ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            {
                kind: ESearchResultKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
                value: {
                    kind: "weapon",
                    id: "MISSING_WEAPON",
                },
            },
            {
                reply: {
                    kind: EMessageKind.ERROR,
                    content: DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT,
                    embeds: [
                        {
                            description: SEARCH_MISSING_DATABASE_RESULT_DESCRIPTION,
                            fields: [
                                { name: SEARCH_ENTITY_KIND_FIELD_NAME, value: "weapon", inline: true },
                                { name: SEARCH_ID_FIELD_NAME, value: "MISSING_WEAPON", inline: true },
                            ],
                        },
                    ],
                },
            },
        ],
    ] as const)("%s", (_, result, expected) => {
        expect(mapSearchResultToMessages(result)).toMatchObject(expected);
    });
});
