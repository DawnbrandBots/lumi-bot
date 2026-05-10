import { defineEntity, p } from "@mikro-orm/core";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER } from "../../../constants.ts";
import type { IWeaponType } from "../types.ts";
import { Color } from "./color.ts";

export const WeaponTypeSchema = defineEntity({
    name: 'WeaponType',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        color: () => p.manyToOne(Color),
        range: p.enum([1, 2]),
    },
})

export class WeaponType extends WeaponTypeSchema.class implements IWeaponType {
    get kind() { return "weaponType" as const }

    get discipleBaseAtkModifier(): number {
        return WEAPON_TYPE_RANGE_ATK_MODIFIER[this.range];
    }
}
WeaponTypeSchema.setClass(WeaponType);
