import { describe, expect, test } from "vitest";
import { Weapon } from "../../../src/game/rules/weapon.ts";
import type { IWeaponSkill } from "../../../src/game/types.ts";

describe(Weapon.typeDiscipleBaseAtkModifier.name, () => {
    test.each([
        [1, 1],
        [2, 2 / 3],
    ] as const)("range %i => %f", (range, expected) => {
        expect(Weapon.typeDiscipleBaseAtkModifier({ range })).toBe(expected);
    });
});

describe(Weapon.variantStat.name, () => {
    test.each(["hp", "atk"] as const)("returns 0 for a level 1 weapon's %s", (stat) => {
        expect(Weapon.variantStat({ weaponData: { level: 1, hp: 100, atk: 100 }, variant: "ATK", stat })).toBe(0);
    });

    test.each([
        ["HP", "hp", 16],
        ["HP", "atk", 35],
        ["NEUTRAL", "hp", 11],
        ["NEUTRAL", "atk", 45],
        ["ATK", "hp", 6],
        ["ATK", "atk", 55],
    ] as const)("returns the %s variant's %s", (variant, stat, expected) => {
        expect(Weapon.variantStat({ weaponData: { level: 8, hp: 6, atk: 35 }, variant, stat })).toBe(expected);
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
