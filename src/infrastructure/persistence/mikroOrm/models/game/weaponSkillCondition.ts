import { defineEntity, p } from "@mikro-orm/sqlite";
import { EWeaponSkillCondition } from "../../../../../domain/game/models/weaponSkillEffect.types.ts";

export const WeaponSkillConditionSchema = defineEntity({
    name: "WeaponSkillCondition",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        kind: p.enum(() => EWeaponSkillCondition),
    },
});
export abstract class WeaponSkillCondition extends WeaponSkillConditionSchema.class {}
WeaponSkillConditionSchema.setClass(WeaponSkillCondition);
