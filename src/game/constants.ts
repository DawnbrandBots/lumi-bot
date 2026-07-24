import { EWeaponVariant } from "./types.ts";

/**
 * Level that can be reached by any disciple as F2P a few games after reaching high rank on both sides.
 */
export const DISCIPLE_MINIMUM_RELEVANT_LEVEL = 8;
export const DISCIPLE_MAXIXUM_LEVEL = 11;

export const WEAPON_MINIMUM_RELEVANT_LEVEL = 6;
export const WEAPON_VARIANTS_BONUSES = {
    [EWeaponVariant.HP]: { hp: 10, atk: 0 },
    [EWeaponVariant.NEUTRAL]: { hp: 5, atk: 10 },
    [EWeaponVariant.ATK]: { hp: 0, atk: 20 },
} as const satisfies { [K in keyof typeof EWeaponVariant]: { hp: number; atk: number } };

/**
 * Strings which can be appended to stems (eg. cross, tetra) without being separated by spaces.
 *
 * Eg. Elthunder, Tetrafire, Crossedge
 */
export const SPELL_NAME_SUFFIXES = ["Fire", "Thunder", "Wind", "Poison", "Heal", "Shield", "Edge"] as const;

export const SPELL_DEFAULT_COOLDOWN = 5;
export const SPELL_DEFAULT_USE_COUNT = null;
export const SPELL_MAXIMUM_LEVEL = 12;
export const SPELL_MINION_ATK_SCALE_CHANGE_LEVEL = 10;
