export const DISCIPLE_BASE_HP = 80;
export const DISCIPLE_BASE_ATK = 36;
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
