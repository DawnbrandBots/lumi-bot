import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillEffectKind,
    type IWeaponSkillOnAutoAttackKillEffect,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillEffectPart } from "./weaponSkillEffectPart.ts";
import { WeaponSkillTimedStatEffect } from "./weaponSkillTimedStatEffect.ts";

export const WeaponSkillOnAutoAttackKillEffectSchema = defineEntity({
    name: "WeaponSkillOnAutoAttackKillEffect",
    embeddable: true,
    extends: WeaponSkillEffectPart,
    discriminatorValue: EWeaponSkillEffectKind.ON_AUTO_ATTACK_KILL,
    properties: {
        kind: p.enum([EWeaponSkillEffectKind.ON_AUTO_ATTACK_KILL]),
        effect: () => p.embedded(WeaponSkillTimedStatEffect).object(),
    },
});
export class WeaponSkillOnAutoAttackKillEffect
    extends WeaponSkillOnAutoAttackKillEffectSchema.class
    implements IWeaponSkillOnAutoAttackKillEffect {}
WeaponSkillOnAutoAttackKillEffectSchema.setClass(WeaponSkillOnAutoAttackKillEffect);
