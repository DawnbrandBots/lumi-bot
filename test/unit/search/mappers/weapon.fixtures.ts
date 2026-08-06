// Disclaimer: AI-generated test fixtures

import type { IWeapon, IWeaponSkill } from "../../../../src/game/types.ts";
import { WEAPON_SKILL_EFFECT, WEAPON_TYPE } from "./common.fixtures.ts";

export const WEAPON_TYPE_SKILL = {
    kind: "weaponSkill",
    id: "ARMOR_BANE_1",
    name: "Armor Bane 1",
    effect: WEAPON_SKILL_EFFECT,
    description: WEAPON_SKILL_EFFECT.description,
    uniqueSkillWeapons: [],
    weaponTypeWeaponSkills: [],
} satisfies IWeaponSkill;

export const UNIQUE_WEAPON_SKILL = {
    kind: "weaponSkill",
    id: "ROYAL_FOCUS",
    name: "Royal Focus",
    effect: {
        kind: "weaponSkillEffect",
        id: "ROYAL_FOCUS_EFFECT",
        description: "Increases damage dealt by this weapon.",
    },
    description: "Increases damage dealt by this weapon.",
    uniqueSkillWeapons: [],
    weaponTypeWeaponSkills: [],
} satisfies IWeaponSkill;

export const WEAPON = {
    kind: "weapon",
    id: "ROYAL_SWORD",
    name: "Royal Sword",
    weaponType: WEAPON_TYPE,
    level: 6,
    hp: 12,
    atk: 34,
    weaponTypeSkill: WEAPON_TYPE_SKILL,
    uniqueSkill: UNIQUE_WEAPON_SKILL,
    freeSkillSlots: 2,
    prfDisciple: null,
    getWeaponVariantStat({ stat, variant }) {
        const bonuses = {
            HP: { hp: 22, atk: 34 },
            NEUTRAL: { hp: 17, atk: 44 },
            ATK: { hp: 12, atk: 54 },
        };
        return bonuses[variant][stat];
    },
} satisfies IWeapon;
