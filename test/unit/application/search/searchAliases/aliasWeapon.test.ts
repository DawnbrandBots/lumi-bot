import { describe, expect, test } from "vitest";
import { SEARCH_ALIAS_GENERATORS } from "../../../../../src/application/search/searchAliases.ts";

const generators = SEARCH_ALIAS_GENERATORS.weapon;

describe("weapon alias generators", () => {
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
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof generators.relative>[0], string[]]>)(
        "%s",
        (_, weapon, expected) => {
            expect([...generators.standalone(weapon), ...generators.relative(weapon)]).toEqual(expected);
        },
    );
});
