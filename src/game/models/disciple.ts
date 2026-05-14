import { defineEntity, p } from "@mikro-orm/sqlite";
import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from "../constants.ts";
import type { IDisciple } from "../types.ts";
import { MovementType } from "./movementType.ts";
import { Spell } from "./spell.ts";
import { Weapon } from "./weapon.ts";
import { WeaponType } from "./weaponType.ts";

export const DiscipleSchema = defineEntity({
    name: "Disciple",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        prfWeapon: () => p.oneToOne(Weapon).inversedBy("prfDisciple").owner(),
        spells: () => p.oneToMany(Spell).mappedBy("disciple"),
    },
});

export class Disciple extends DiscipleSchema.class implements IDisciple {
    public get kind() {
        return "disciple" as const;
    }

    public get baseHp() {
        return Math.floor(DISCIPLE_BASE_HP * this.movementType.discipleBaseHpModifier);
    }

    public get baseAtk() {
        return Math.floor(
            DISCIPLE_BASE_ATK * this.movementType.discipleBaseAtkModifier * this.weaponType.discipleBaseAtkModifier,
        );
    }

    public getHp({ level }: { level: number }): number {
        return Math.floor(this.baseHp * (1 + 0.1 * (level - 1)));
    }

    public getAtk({ level }: { level: number }): number {
        return Math.floor(this.baseAtk * (1 + 0.1 * (level - 1)));
    }
}
DiscipleSchema.setClass(Disciple);
