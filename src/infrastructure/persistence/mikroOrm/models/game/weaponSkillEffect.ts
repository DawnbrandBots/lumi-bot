import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IWeaponSkillEffect } from "../../../../../domain/game/models/weaponSkillEffect.types.ts";

export const WeaponSkillEffectSchema = defineEntity({
    name: "WeaponSkillEffect",
    properties: {
        id: p.string().primary(),
        description: p.string(),
    },
});

export class WeaponSkillEffect extends WeaponSkillEffectSchema.class implements IWeaponSkillEffect {
    get kind() {
        return "weaponSkillEffect" as const;
    }
}
WeaponSkillEffectSchema.setClass(WeaponSkillEffect);
