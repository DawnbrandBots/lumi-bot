import { describe, expect, test } from "vitest";
import mapMusicToMessage from "../../../../src/search/mappers/music.ts";
import { MUSIC } from "./music.fixtures.ts";

describe(mapMusicToMessage.name, () => {
    test.each([
        ["with a URL and linked disciple", MUSIC],
        [
            "without a URL",
            {
                ...MUSIC,
                url: null,
            },
        ],
        [
            "without linked disciples",
            {
                ...MUSIC,
                shadowMusicFor: [],
            },
        ],
    ])("%s", (_, music) => {
        expect(mapMusicToMessage(music)).toMatchSnapshot();
    });
});
