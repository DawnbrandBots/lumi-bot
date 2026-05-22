import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IWeaponSkill } from "../types.ts";
import { Weapon } from "./weapon.ts";
import { WeaponSkillEffect } from "./weaponSkillEffect.ts";
import { WeaponTypeWeaponSkill } from "./weaponTypeWeaponSkill.ts";

export const WeaponSkillSchema = defineEntity({
    name: "WeaponSkill",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        effect: () => p.manyToOne(WeaponSkillEffect),
        uniqueSkillWeapons: () => p.oneToMany(Weapon).mappedBy("uniqueSkill"),
        weaponTypeWeaponSkills: () => p.oneToMany(WeaponTypeWeaponSkill).mappedBy("weaponSkill"),
    },
});

export class WeaponSkill extends WeaponSkillSchema.class implements IWeaponSkill {
    get kind() {
        return "weaponSkill" as const;
    }

    get description(): string {
        return this.effect.description;
    }
}
WeaponSkillSchema.setClass(WeaponSkill);
