import { describe, expect, test } from "vitest";
import { SEARCH_ALIAS_GENERATORS } from "../../../../../src/application/search/searchAliases.ts";

const generators = SEARCH_ALIAS_GENERATORS.weaponSkill;

describe("weapon skill alias generators", () => {
    test.each([
        [
            "without unique weapons",
            {
                name: "Armor Bane 1",
                uniqueSkillWeapons: [],
            },
            ["Armor Bane 1"],
        ],
        [
            "with unique weapon aliases",
            {
                name: "Royal Scion",
                uniqueSkillWeapons: [{ name: "Royal Sword +" }],
            },
            ["Royal Scion", "Royal Sword + weapon skill", "Royal Sword Plus weapon skill"],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof generators.relative>[0], string[]]>)(
        "%s",
        (_, weaponSkill, expected) => {
            expect([...generators.standalone(weaponSkill), ...generators.relative(weaponSkill)]).toEqual(expected);
        },
    );
});
