export const DISCIPLE_BASE_HP = 80;
export const DISCIPLE_BASE_ATK = 36;
/**
 * Level that can be reached by any disciple as F2P a few games after reaching high rank on both sides.
 */
export const DISCIPLE_MINIMUM_RELEVANT_LEVEL = 8;
export const DISCIPLE_MAXIXUM_LEVEL = 11;

export const WEAPON_MINIMUM_RELEVANT_LEVEL = 6;
export const WEAPON_VARIANTS_BONUSES = {
    HP: { hp: 10, atk: 0 },
    NEUTRAL: { hp: 5, atk: 10 },
    ATK: { hp: 0, atk: 20 },
} as const;

export const WEAPON_TYPE_RANGE_ATK_MODIFIER = {
    1: 1,
    2: 2 / 3,
} as const;

/**
 * Strings which can be appended to stems (eg. cross, tetra) without being separated by spaces.
 *
 * Eg. Elthunder, Tetrafire, Crossedge
 */
export const SPELL_NAME_SUFFIXES = ["Fire", "Thunder", "Wind", "Poison", "Heal", "Shield", "Edge"] as const;
