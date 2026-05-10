import { defineEntity, p } from "@mikro-orm/core";
import type { IWeaponType } from "../types.ts";
import { Color } from "./color.ts";

export const WeaponTypeSchema = defineEntity({
    name: 'WeaponType',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        color: () => p.manyToOne(Color),
        range: p.integer(),
    },
})

export class WeaponType extends WeaponTypeSchema.class implements IWeaponType {
    get kind() { return "weaponType" as const }

    get discipleBaseAtkModifier(): number {
        return this.range === 1 ? 1 : 2 / 3;
    }
}
WeaponTypeSchema.setClass(WeaponType);
