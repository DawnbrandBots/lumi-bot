// Disclaimer: AI-generated test fixtures

import type { IColor, IMovementType, IWeaponSkillEffect, IWeaponType } from "../../../../src/game/types.ts";

export const RED_COLOR = {
    kind: "color",
    id: "RED",
    name: "Red",
    strongAgainst: null,
    weakAgainst: null,
} satisfies IColor;

export const INFANTRY_MOVEMENT_TYPE = {
    kind: "movement",
    id: "INFANTRY",
    name: "Infantry",
    distance: 2,
    canTraverseWaterTiles: false,
    baseHp: 80,
    baseAtkByRange: {
        1: 42,
        2: 28,
    },
} satisfies IMovementType;

export const WEAPON_SKILL_EFFECT = {
    kind: "weaponSkillEffect",
    id: "ARMOR_BANE_EFFECT",
    description: "Deals more damage to Armored units.",
} satisfies IWeaponSkillEffect;

export const WEAPON_TYPE = {
    kind: "weaponType",
    id: "SWORD",
    name: "Sword",
    color: RED_COLOR,
    range: 1,
    weaponSkills: [],
} satisfies IWeaponType;
