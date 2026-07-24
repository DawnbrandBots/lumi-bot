import { describe, expect, test } from "vitest";
import mapWeaponToMessage from "../../../../src/search/mappers/weapon.ts";
import { DISCIPLE } from "./disciple.fixtures.ts";
import { WEAPON } from "./weapon.fixtures.ts";

describe(mapWeaponToMessage.name, () => {
    test.each([
        ["with skills", WEAPON],
        [
            "with an exclusive disciple",
            {
                ...WEAPON,
                prfDisciple: DISCIPLE,
            },
        ],
        [
            "without optional skills",
            {
                ...WEAPON,
                weaponTypeSkill: null,
                uniqueSkill: null,
            },
        ],
    ])("%s", (_, weapon) => {
        expect(mapWeaponToMessage(weapon)).toMatchSnapshot();
    });
});
