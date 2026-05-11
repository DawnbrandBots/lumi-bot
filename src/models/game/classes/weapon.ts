import { defineEntity, p } from "@mikro-orm/core";
import { WEAPON_VARIANTS_BONUSES } from "../constants.ts";
import type { IWeapon } from "../types.ts";
import { Disciple } from "./disciple.ts";
import { WeaponSkill } from "./weaponSkill.ts";
import { WeaponType } from "./weaponType.ts";

export const WeaponSchema = defineEntity({
    name: "Weapon",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        weaponType: () => p.manyToOne(WeaponType),
        level: p.integer(),
        hp: p.integer(),
        atk: p.integer(),
        freeSkillSlots: p.integer(),
        uniqueSkill: () => p.manyToOne(WeaponSkill).inversedBy("weapons").nullable(),
        prfDisciple: () => p.oneToOne(Disciple).mappedBy("prfWeapon").nullable(),
    },
});

export class Weapon extends WeaponSchema.class implements IWeapon {
    get kind() {
        return "weapon" as const;
    }

    public getWeaponVariantStat({ stat, variant }: { variant: "HP" | "NEUTRAL" | "ATK"; stat: "hp" | "atk" }): number {
        return this.level === 1 ? 0 : this[stat] + WEAPON_VARIANTS_BONUSES[variant][stat];
    }
}
WeaponSchema.setClass(Weapon);
