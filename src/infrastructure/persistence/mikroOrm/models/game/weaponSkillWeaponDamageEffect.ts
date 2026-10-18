import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillEffectChange,
    EWeaponSkillEffectKind,
    EWeaponSkillWeaponDamageAction,
    type IWeaponSkillWeaponDamageEffect,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillEffectPart } from "./weaponSkillEffectPart.ts";
import { WeaponSkillFoeCondition } from "./weaponSkillFoeCondition.ts";
import { WeaponSkillHpCondition } from "./weaponSkillHpCondition.ts";

export const WeaponSkillWeaponDamageEffectSchema = defineEntity({
    name: "WeaponSkillWeaponDamageEffect",
    embeddable: true,
    extends: WeaponSkillEffectPart,
    discriminatorValue: EWeaponSkillEffectKind.WEAPON_DAMAGE_CHANGE,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.WEAPON_DAMAGE_CHANGE]),
        action: p.enum(() => EWeaponSkillWeaponDamageAction),
        change: p.enum(() => EWeaponSkillEffectChange),
        amount: p.integer(),
        condition: () => p.embedded([WeaponSkillHpCondition, WeaponSkillFoeCondition]).object().nullable(),
    },
});
export class WeaponSkillWeaponDamageEffect
    extends WeaponSkillWeaponDamageEffectSchema.class
    implements IWeaponSkillWeaponDamageEffect {}
WeaponSkillWeaponDamageEffectSchema.setClass(WeaponSkillWeaponDamageEffect);
