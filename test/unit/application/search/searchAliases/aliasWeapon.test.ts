import { describe, expect, test } from "vitest";
import { aliasWeapon } from "../../../../../src/application/search/searchAliases.ts";

describe(aliasWeapon.name, () => {
    test.each([
        [
            "without relative aliases",
            {
                name: "Royal Sword",
                prfDisciple: null,
            },
            ["Royal Sword"],
        ],
        [
            "with plus and exclusive disciple aliases",
            {
                name: "Royal Sword +",
                prfDisciple: { name: "Kurt" },
            },
            ["Royal Sword +", "Royal Sword Plus", "Kurt weapon"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasWeapon>[0], string[]]>)(
        "%s",
        (_, weapon, expected) => {
            expect([...aliasWeapon(weapon)]).toEqual(expected);
        },
    );
});
