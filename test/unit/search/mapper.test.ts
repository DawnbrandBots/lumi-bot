import { Collection } from "@mikro-orm/sqlite";
import { describe, expect, test } from "vitest";
import { SEARCH_MAX_INPUT_LENGTH } from "../../../src/application/search/constants.ts";
import type { TSearchFeatureSuccessValue } from "../../../src/application/search/types.ts";
import { ESearchFeatureReturnKind } from "../../../src/application/search/types.ts";
import type { Disciple } from "../../../src/infrastructure/game/models/disciple.ts";
import { DISCORD_ERROR_MESSAGE_DEFAULT_CONTENT } from "../../../src/presentation/discord/constants.ts";
import mapSearchFeatureReturnToMessages, {
    mapSearchFeatureSuccessValueToMessages,
} from "../../../src/presentation/discord/mappers/search.ts";
import { EMessageKind } from "../../../src/presentation/discord/message.types.ts";

const SEARCH_ALIASES_FOOTER_PREFIX = "Search aliases:";
const SEARCH_ENTITY_KIND_FIELD_NAME = "Entity kind";
const SEARCH_ID_FIELD_NAME = "Id";
const SEARCH_INPUT_TOO_LONG_DESCRIPTION = `Input too long. Maximum is ${SEARCH_MAX_INPUT_LENGTH} characters.`;
const SEARCH_YIELDED_NO_RESULT_DESCRIPTION = "Search yielded no result";
const SEARCH_MISSING_DATABASE_RESULT_DESCRIPTION = "Result found in search engine but not in database";

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
        expect(mapSearchFeatureReturnToMessages(result)).toMatchObject(expected);
    });
});
