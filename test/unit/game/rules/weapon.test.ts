import { describe, expect, test } from "vitest";
import {
    getWeaponTypeDiscipleBaseAtkModifier,
    getWeaponTypeSkillRankByWeaponLevel,
    getWeaponVariantStat,
} from "../../../../src/game/rules/weapon.ts";

describe(getWeaponTypeDiscipleBaseAtkModifier.name, () => {
    test.each([
        [1, 1],
        [2, 2 / 3],
    ] as const)("range %i => %f", (range, expected) => {
        expect(getWeaponTypeDiscipleBaseAtkModifier({ range })).toBe(expected);
    });
});

describe(getWeaponVariantStat.name, () => {
    test.each(["hp", "atk"] as const)("returns 0 for a level 1 weapon's %s", (stat) => {
        expect(getWeaponVariantStat({ weaponData: { level: 1, hp: 100, atk: 100 }, variant: "ATK", stat })).toBe(0);
    });

    test.each([
        ["HP", "hp", 16],
        ["HP", "atk", 35],
        ["NEUTRAL", "hp", 11],
        ["NEUTRAL", "atk", 45],
        ["ATK", "hp", 6],
        ["ATK", "atk", 55],
    ] as const)("returns the %s variant's %s", (variant, stat, expected) => {
        expect(getWeaponVariantStat({ weaponData: { level: 8, hp: 6, atk: 35 }, variant, stat })).toBe(expected);
    });
});

describe(getWeaponTypeSkillRankByWeaponLevel.name, () => {
    test.each([
        [1, null],
        [2, 0],
        [3, 0],
        [4, 1],
        [5, 1],
        [6, 2],
        [8, 2],
    ])("selects the skill for weapon level %i", (level, expected) => {
        expect(getWeaponTypeSkillRankByWeaponLevel({ level })).toBe(expected);
    });
});
