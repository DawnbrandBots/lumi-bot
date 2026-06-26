import { defineEntity, p } from "@mikro-orm/sqlite";
import { getDiscipleAtk, getDiscipleBaseAtk, getDiscipleBaseHp, getDiscipleHp } from "../discipleStats.ts";
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
        return getDiscipleBaseHp(this);
    }

    public get baseAtk() {
        return getDiscipleBaseAtk(this);
    }

    public getHp({ level }: { level: number }): number {
        return getDiscipleHp({ discipleData: this, level });
    }

    public getAtk({ level }: { level: number }): number {
        return getDiscipleAtk({ discipleData: this, level });
    }
}
DiscipleSchema.setClass(Disciple);
