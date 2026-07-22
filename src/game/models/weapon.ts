import { defineEntity, p } from "@mikro-orm/sqlite";
import { Weapon as WeaponRules } from "../rules/weapon.ts";
import type { IWeapon, IWeaponSkill } from "../types.ts";
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
        uniqueSkill: () => p.manyToOne(WeaponSkill).inversedBy("uniqueSkillWeapons").nullable(),
        prfDisciple: () => p.oneToOne(Disciple).mappedBy("prfWeapon").nullable(),
    },
});

export class Weapon extends WeaponSchema.class implements IWeapon {
    get kind() {
        return "weapon" as const;
    }

    public getWeaponVariantStat({ stat, variant }: { variant: "HP" | "NEUTRAL" | "ATK"; stat: "hp" | "atk" }): number {
        return WeaponRules.variantStat({ weaponData: this, stat, variant });
    }

    public get weaponTypeSkill(): IWeaponSkill | null | undefined {
        return WeaponRules.typeSkill(this);
    }
}
WeaponSchema.setClass(Weapon);
