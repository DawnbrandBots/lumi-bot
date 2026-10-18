import { defineEntity, p } from "@mikro-orm/sqlite";
import { EStat } from "../../../../../domain/game/models/stat.types.ts";
import {
    EWeaponSkillEffectChange,
    EWeaponSkillEffectKind,
    type IWeaponSkillStatusEffectOnAutoAttackKill,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillEffectPart } from "./weaponSkillEffectPart.ts";

export const WeaponSkillStatusEffectOnAutoAttackKillSchema = defineEntity({
    name: "WeaponSkillStatusEffectOnAutoAttackKill",
    embeddable: true,
    extends: WeaponSkillEffectPart,
    discriminatorValue: EWeaponSkillEffectKind.STATUS_EFFECT_ON_AUTO_ATTACK_KILL,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.STATUS_EFFECT_ON_AUTO_ATTACK_KILL]),
        stat: p.enum(() => EStat),
        change: p.enum(() => EWeaponSkillEffectChange),
        amount: p.integer(),
        duration: p.integer(),
    },
});
export class WeaponSkillStatusEffectOnAutoAttackKill
    extends WeaponSkillStatusEffectOnAutoAttackKillSchema.class
    implements IWeaponSkillStatusEffectOnAutoAttackKill {}
WeaponSkillStatusEffectOnAutoAttackKillSchema.setClass(WeaponSkillStatusEffectOnAutoAttackKill);
