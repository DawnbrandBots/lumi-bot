import { describe, expect, test } from "vitest";
import mapWeaponSkillToMessage from "../../../../src/search/mappers/weaponSkill.ts";
import { WEAPON_SKILL } from "./weaponSkill.fixtures.ts";

describe(mapWeaponSkillToMessage.name, () => {
    test.each([
        ["with weapon type and unique usages", WEAPON_SKILL],
        [
            "without usages",
            {
                ...WEAPON_SKILL,
                uniqueSkillWeapons: [],
                weaponTypeWeaponSkills: [],
            },
        ],
    ])("%s", (_, weaponSkill) => {
        expect(mapWeaponSkillToMessage(weaponSkill)).toMatchSnapshot();
    });
});
