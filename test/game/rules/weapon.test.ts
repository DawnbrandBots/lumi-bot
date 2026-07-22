import { describe, expect, test } from "vitest";
import Weapon from "../../../src/game/rules/weapon.ts";
import type { IWeaponSkill } from "../../../src/game/types.ts";

describe(Weapon.typeDiscipleBaseAtkModifier.name, () => {
    test.each([
        [1, 1],
        [2, 2 / 3],
    ] as const)("range %i => %f", (range, expected) => {
        expect(Weapon.typeDiscipleBaseAtkModifier({ range })).toBe(expected);
    });
});

describe(Weapon.typeSkill.name, () => {
    const skills = [{ id: "rank-1" }, { id: "rank-2" }, { id: "rank-3" }] as IWeaponSkill[];

    test.each([
        [1, null],
        [2, skills[0]],
        [3, skills[0]],
        [4, skills[1]],
        [5, skills[1]],
        [6, skills[2]],
        [8, skills[2]],
    ])("selects the skill for weapon level %i", (level, expected) => {
        expect(Weapon.typeSkill({ level, weaponType: { weaponSkills: skills } })).toBe(expected);
    });

    test("returns undefined when no skill exists for the weapon level", () => {
        expect(Weapon.typeSkill({ level: 8, weaponType: { weaponSkills: [] } })).toBeUndefined();
    });
});
