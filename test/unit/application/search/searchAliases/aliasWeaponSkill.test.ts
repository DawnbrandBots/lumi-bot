import { describe, expect, test } from "vitest";
import { aliasWeaponSkill } from "../../../../../src/application/search/searchAliases.ts";

describe(aliasWeaponSkill.name, () => {
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
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof aliasWeaponSkill>[0], string[]]>)(
        "%s",
        (_, weaponSkill, expected) => {
            expect([...aliasWeaponSkill(weaponSkill)]).toEqual(expected);
        },
    );
});
