import { describe, expect, test } from "vitest";
import { mapSearchSuccessValueToMessages } from "../../../../../../src/presentation/discord/mappers/search.ts";
import { MUSIC_SEARCH_SUCCESS_VALUE } from "./root.fixtures.ts";

const SEARCH_ALIASES_FOOTER_PREFIX = "Search aliases:";

describe(mapSearchSuccessValueToMessages.name, () => {
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
        expect(mapSearchSuccessValueToMessages(value).reply.embed.footer).toEqual(expectedFooter);
    });
});
