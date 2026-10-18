import { defineEntity, p } from "@mikro-orm/sqlite";
import { EWeaponSkillEffectKind } from "../../../../../domain/game/models/weaponSkillEffect.types.ts";

export const WeaponSkillEffectPartSchema = defineEntity({
    name: "WeaponSkillEffectPart",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        kind: p.enum(() => EWeaponSkillEffectKind),
    },
});
export abstract class WeaponSkillEffectPart extends WeaponSkillEffectPartSchema.class {}
WeaponSkillEffectPartSchema.setClass(WeaponSkillEffectPart);
