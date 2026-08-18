// Disclaimer: AI-generated test fixtures

import type { IColor } from "../../../../../../src/domain/game/models/color.types.ts";
import type { IMovementType } from "../../../../../../src/domain/game/models/movement.types.ts";
import type { IWeaponSkillEffect } from "../../../../../../src/domain/game/models/weaponSkillEffect.types.ts";
import type { IWeaponType } from "../../../../../../src/domain/game/models/weaponType.types.ts";

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
