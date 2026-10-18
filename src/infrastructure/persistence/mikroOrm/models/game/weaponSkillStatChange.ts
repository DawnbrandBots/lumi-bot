import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillEffectChange,
    type IWeaponSkillStatChange,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";

export const WeaponSkillStatChangeSchema = defineEntity({
    name: "WeaponSkillStatChange",
    embeddable: true,
    properties: {
        change: p.enum(() => EWeaponSkillEffectChange),
        amount: p.integer(),
    },
});
export class WeaponSkillStatChange extends WeaponSkillStatChangeSchema.class implements IWeaponSkillStatChange {}
WeaponSkillStatChangeSchema.setClass(WeaponSkillStatChange);
