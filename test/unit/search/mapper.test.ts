import { Collection } from "@mikro-orm/sqlite";
import { describe, expect, test } from "vitest";
import { DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT } from "../../../src/bot/constants.ts";
import { EMessageKind } from "../../../src/bot/types.ts";
import type { Disciple } from "../../../src/game/models/disciple.ts";
import {
    SEARCH_ALIASES_FOOTER_PREFIX,
    SEARCH_ENTITY_KIND_FIELD_NAME,
    SEARCH_ID_FIELD_NAME,
    SEARCH_INPUT_TITLE,
    SEARCH_INPUT_TOO_LONG_DESCRIPTION,
    SEARCH_INVALID_INPUT_TITLE,
    SEARCH_MISSING_DATABASE_RESULT_TITLE,
    SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
} from "../../../src/search/constants.ts";
import mapSearchFeatureReturnToMessages, {
    mapSearchFeatureSuccessValueToMessages,
} from "../../../src/search/mapper.ts";
import { ESearchFeatureReturnKind, type TSearchFeatureSuccessValue } from "../../../src/search/types.ts";

const MUSIC = {
    kind: "music",
    id: "TEST_MUSIC",
    name: "Test Music",
    url: null,
    // TODO: there's something wrong with the types if creating collections is required here
    shadowMusicFor: new Collection<Disciple>({}, []),
    shadowResultsScreenMusicFor: new Collection<Disciple>({}, []),
} as const;

const MUSIC_SEARCH_SUCCESS_VALUE = {
    kind: "music",
    entity: MUSIC,
    searchItem: {
        id: MUSIC.id,
        kind: "music",
        name: MUSIC.name,
        aliases: [MUSIC.name],
    },
} satisfies TSearchFeatureSuccessValue<"music">;

describe(mapSearchFeatureSuccessValueToMessages.name, () => {
    test.each([
        ["without footer when the search item has one alias", MUSIC_SEARCH_SUCCESS_VALUE, undefined],
        [
            "with footer when the search item has multiple aliases",
            {
                ...MUSIC_SEARCH_SUCCESS_VALUE,
                searchItem: {
                    ...MUSIC_SEARCH_SUCCESS_VALUE.searchItem,
                    aliases: ["Test Music", "Shadow Test Music"],
                },
            },
            {
                text: `${SEARCH_ALIASES_FOOTER_PREFIX} Test Music, Shadow Test Music`,
            },
        ],
    ])("%s", (_, value, expectedFooter) => {
        expect(mapSearchFeatureSuccessValueToMessages(value).reply.embed.footer).toEqual(expectedFooter);
    });
});

describe(mapSearchFeatureReturnToMessages.name, () => {
    test.each([
        [
            ESearchFeatureReturnKind.SUCCESS,
            {
                kind: ESearchFeatureReturnKind.SUCCESS,
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
            ESearchFeatureReturnKind.INPUT_TOO_LONG,
            {
                kind: ESearchFeatureReturnKind.INPUT_TOO_LONG,
            },
            {
                reply: {
                    kind: EMessageKind.NEGATIVE,
                    embeds: [
                        {
                            title: SEARCH_INVALID_INPUT_TITLE,
                            description: SEARCH_INPUT_TOO_LONG_DESCRIPTION,
                        },
                    ],
                },
            },
        ],
        [
            ESearchFeatureReturnKind.NO_RESULT,
            {
                kind: ESearchFeatureReturnKind.NO_RESULT,
            },
            {
                reply: {
                    kind: EMessageKind.NEGATIVE,
                    embeds: [
                        {
                            title: SEARCH_INPUT_TITLE,
                            description: SEARCH_YIELDED_NO_RESULT_DESCRIPTION,
                        },
                    ],
                },
            },
        ],
        [
            ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
            {
                kind: ESearchFeatureReturnKind.FOUND_BY_ENGINE_BUT_NOT_BY_DB,
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
                            title: SEARCH_MISSING_DATABASE_RESULT_TITLE,
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
        expect(mapSearchFeatureReturnToMessages(result)).toMatchObject(expected);
    });
});
