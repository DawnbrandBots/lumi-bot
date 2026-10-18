import { defineEntity, p } from "@mikro-orm/sqlite";
import { EStat } from "../../../../../domain/game/models/stat.types.ts";
import {
    EWeaponSkillEffectChange,
    EWeaponSkillEffectKind,
    type IWeaponSkillTimedStatEffect,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";

export const WeaponSkillTimedStatEffectSchema = defineEntity({
    name: "WeaponSkillTimedStatEffect",
    embeddable: true,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.STAT_CHANGE]),
        stat: p.enum(() => EStat),
        change: p.enum(() => EWeaponSkillEffectChange),
        amount: p.integer(),
        duration: p.integer(),
    },
});
export class WeaponSkillTimedStatEffect
    extends WeaponSkillTimedStatEffectSchema.class
    implements IWeaponSkillTimedStatEffect {}
WeaponSkillTimedStatEffectSchema.setClass(WeaponSkillTimedStatEffect);
