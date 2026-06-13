import { defineEntity, p } from "@mikro-orm/sqlite";
import { GAME_DB_SCHEMA } from "../../db/constants.ts";
import type { IWeaponSkillEffect } from "../types.ts";

export const WeaponSkillEffectSchema = defineEntity({
    name: "WeaponSkillEffect",
    schema: GAME_DB_SCHEMA,
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
