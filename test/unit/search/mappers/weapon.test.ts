import { describe, expect, test } from "vitest";
import mapWeaponToMessage from "../../../../src/search/mappers/weapon.ts";
import { DISCIPLE, WEAPON } from "./utils.ts";

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
