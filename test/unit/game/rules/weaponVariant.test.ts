import { describe, expect, test } from "vitest";
import WeaponVariant, { WEAPON_VARIANTS } from "../../../../src/game/rules/weaponVariant.ts";

describe(WeaponVariant.stat.name, () => {
    test.each(["hp", "atk"] as const)("returns 0 for a level 1 weapon's %s", (stat) => {
        expect(
            WeaponVariant.stat({
                weaponData: { level: 1, hp: 100, atk: 100 },
                weaponVariantData: WEAPON_VARIANTS.ATK,
                variant: "ATK",
                stat,
            }),
        ).toBe(0);
    });

    test.each([
        [WEAPON_VARIANTS.HP, "HP", "hp", 16],
        [WEAPON_VARIANTS.HP, "HP", "atk", 35],
        [WEAPON_VARIANTS.NEUTRAL, "NEUTRAL", "hp", 11],
        [WEAPON_VARIANTS.NEUTRAL, "NEUTRAL", "atk", 45],
        [WEAPON_VARIANTS.ATK, "ATK", "hp", 6],
        [WEAPON_VARIANTS.ATK, "ATK", "atk", 55],
    ] as const)("returns the %s variant's %s", (weaponVariantData, variant, stat, expected) => {
        expect(WeaponVariant.stat({ weaponData: { level: 8, hp: 6, atk: 35 }, weaponVariantData, variant, stat })).toBe(
            expected,
        );
    });
});
