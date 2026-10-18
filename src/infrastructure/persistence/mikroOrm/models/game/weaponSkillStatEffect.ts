import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillEffectKind,
    type IWeaponSkillStatEffect,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillEffectPart } from "./weaponSkillEffectPart.ts";
import { WeaponSkillStatChange } from "./weaponSkillStatChange.ts";

export const WeaponSkillStatEffectSchema = defineEntity({
    name: "WeaponSkillStatEffect",
    embeddable: true,
    extends: WeaponSkillEffectPart,
    discriminatorValue: EWeaponSkillEffectKind.STAT_CHANGE,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.STAT_CHANGE]),
        HP: () => p.embedded(WeaponSkillStatChange).object().nullable(),
        ATK: () => p.embedded(WeaponSkillStatChange).object().nullable(),
    },
});
export class WeaponSkillStatEffect extends WeaponSkillStatEffectSchema.class implements IWeaponSkillStatEffect {}
WeaponSkillStatEffectSchema.setClass(WeaponSkillStatEffect);
