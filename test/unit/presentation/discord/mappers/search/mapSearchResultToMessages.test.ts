import { describe, expect, test } from "vitest";
import { ESearchResultKind } from "../../../../../../src/application/search/types.ts";
import mapSearchResultToMessages from "../../../../../../src/presentation/discord/mappers/search.ts";
import { MUSIC_SEARCH_SUCCESS_VALUE } from "./root.fixtures.ts";

describe(mapSearchResultToMessages.name, () => {
    test.each([
        [
            ESearchResultKind.SUCCESS,
            {
                kind: ESearchResultKind.SUCCESS,
                value: MUSIC_SEARCH_SUCCESS_VALUE,
            },
        ],
        [
            ESearchResultKind.INPUT_TOO_LONG,
            {
                kind: ESearchResultKind.INPUT_TOO_LONG,
            },
        ],
        [
            ESearchResultKind.NO_RESULT,
            {
                kind: ESearchResultKind.NO_RESULT,
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
        ],
    ] as const)("%s", (_, result) => {
        expect(mapSearchResultToMessages(result)).toMatchSnapshot();
    });
});
