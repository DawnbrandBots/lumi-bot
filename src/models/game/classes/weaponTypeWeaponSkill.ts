import { defineEntity, p } from "@mikro-orm/core";
import type { IWeaponTypeWeaponSkill } from "../types.ts";
import { WeaponSkill } from "./weaponSkill.ts";
import { WeaponType } from "./weaponType.ts";

export const WeaponTypeWeaponSkillSchema = defineEntity({
    name: "WeaponTypeWeaponSkill",
    properties: {
        weaponType: () => p.manyToOne(WeaponType).inversedBy("_weaponTypeSkills").primary(),
        weaponSkill: () => p.manyToOne(WeaponSkill).primary(),
    },
});

export class WeaponTypeWeaponSkill extends WeaponTypeWeaponSkillSchema.class implements IWeaponTypeWeaponSkill {
    get kind() {
        return "weaponTypeWeaponSkill" as const;
    }
}
WeaponTypeWeaponSkillSchema.setClass(WeaponTypeWeaponSkill);
