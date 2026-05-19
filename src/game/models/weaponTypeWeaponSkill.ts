import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IWeaponTypeWeaponSkill } from "../types.ts";
import { WeaponSkill } from "./weaponSkill.ts";
import { WeaponType } from "./weaponType.ts";

export const WeaponTypeWeaponSkillSchema = defineEntity({
    name: "WeaponTypeWeaponSkill",
    properties: {
        weaponType: () => p.manyToOne(WeaponType).primary(),
        weaponSkill: () => p.manyToOne(WeaponSkill).primary(),
    },
});

export class WeaponTypeWeaponSkill extends WeaponTypeWeaponSkillSchema.class implements IWeaponTypeWeaponSkill {
    get kind() {
        return "weaponTypeWeaponSkill" as const;
    }
}
WeaponTypeWeaponSkillSchema.setClass(WeaponTypeWeaponSkill);
