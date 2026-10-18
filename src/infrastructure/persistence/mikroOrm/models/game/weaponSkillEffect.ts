import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IWeaponSkillEffect } from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillOnAutoAttackKillEffect } from "./weaponSkillOnAutoAttackKillEffect.ts";
import { WeaponSkillStatEffect } from "./weaponSkillStatEffect.ts";
import { WeaponSkillWeaponDamageEffect } from "./weaponSkillWeaponDamageEffect.ts";

export const WeaponSkillEffectSchema = defineEntity({
    name: "WeaponSkillEffect",
    properties: {
        id: p.string().primary(),
        effect: () =>
            p
                .embedded([WeaponSkillOnAutoAttackKillEffect, WeaponSkillStatEffect, WeaponSkillWeaponDamageEffect])
                .object(),
    },
});

export class WeaponSkillEffect extends WeaponSkillEffectSchema.class implements IWeaponSkillEffect {
    get kind() {
        return "weaponSkillEffect" as const;
    }
}
WeaponSkillEffectSchema.setClass(WeaponSkillEffect);
