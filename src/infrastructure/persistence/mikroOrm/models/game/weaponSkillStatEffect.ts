import { defineEntity, p } from "@mikro-orm/sqlite";
import { EStat } from "../../../../../domain/game/models/stat.types.ts";
import {
    EWeaponSkillEffectChange,
    EWeaponSkillEffectKind,
    type IWeaponSkillStatEffect,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillEffectPart } from "./weaponSkillEffectPart.ts";

export const WeaponSkillStatEffectSchema = defineEntity({
    name: "WeaponSkillStatEffect",
    embeddable: true,
    extends: WeaponSkillEffectPart,
    discriminatorValue: EWeaponSkillEffectKind.STAT_CHANGE,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.STAT_CHANGE]),
        stat: p.enum(() => EStat),
        change: p.enum(() => EWeaponSkillEffectChange),
        amount: p.integer(),
    },
});
export class WeaponSkillStatEffect extends WeaponSkillStatEffectSchema.class implements IWeaponSkillStatEffect {}
WeaponSkillStatEffectSchema.setClass(WeaponSkillStatEffect);
