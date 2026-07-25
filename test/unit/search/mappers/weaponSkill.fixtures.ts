// Disclaimer: AI-generated test fixtures

import type { IWeaponSkill, IWeaponTypeWeaponSkill } from "../../../../src/game/types.ts";
import { WEAPON_SKILL_EFFECT, WEAPON_TYPE } from "./common.fixtures.ts";
import { WEAPON, WEAPON_TYPE_SKILL } from "./weapon.fixtures.ts";

export const WEAPON_TYPE_WEAPON_SKILL = {
    kind: "weaponTypeWeaponSkill",
    weaponType: WEAPON_TYPE,
    weaponSkill: WEAPON_TYPE_SKILL,
    rank: 2,
} satisfies IWeaponTypeWeaponSkill;

export const WEAPON_SKILL = {
    kind: "weaponSkill",
    id: "ARMOR_BANE_2",
    name: "Armor Bane 2",
    effect: WEAPON_SKILL_EFFECT,
    description: WEAPON_SKILL_EFFECT.description,
    uniqueSkillWeapons: [WEAPON],
    weaponTypeWeaponSkills: [WEAPON_TYPE_WEAPON_SKILL],
} satisfies IWeaponSkill;
