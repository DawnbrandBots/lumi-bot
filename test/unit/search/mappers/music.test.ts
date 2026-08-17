import { describe, expect, test } from "vitest";
import mapMusicToMessage from "../../../../src/presentation/discord/mappers/search/music.ts";
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
