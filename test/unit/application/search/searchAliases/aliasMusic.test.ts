import { describe, expect, test } from "vitest";
import { aliasMusic } from "../../../../../src/application/search/searchAliases.ts";

describe(aliasMusic.name, () => {
    test.each([
        [
            "without disciple relations",
            {
                name: "Theme of Love",
                shadowMusicFor: null,
                shadowResultsScreenMusicFor: undefined,
            },
            ["Theme of Love"],
        ],
        [
            "with battle disciple aliases",
            {
                name: "Betrayal – The Exiled Prince",
                shadowMusicFor: [{ name: "Kurt" }],
            },
            ["Betrayal – The Exiled Prince", "Shadow Kurt music"],
        ],
        [
            "with results screen disciple aliases",
            {
                name: "Betrayal – The Exiled Prince (Results screen)",
                shadowResultsScreenMusicFor: [{ name: "Kurt" }],
            },
            ["Betrayal – The Exiled Prince (Results screen)", "Shadow Kurt results screen music"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasMusic>[0], string[]]>)(
        "%s",
        (_, music, expected) => {
            expect([...aliasMusic(music)]).toEqual(expected);
        },
    );
});
