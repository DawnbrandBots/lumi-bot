import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillCondition,
    EWeaponSkillHpOperand,
    type IWeaponSkillHpCondition,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { WeaponSkillCondition } from "./weaponSkillCondition.ts";

export const WeaponSkillHpConditionSchema = defineEntity({
    name: "WeaponSkillHpCondition",
    embeddable: true,
    extends: WeaponSkillCondition,
    discriminatorValue: EWeaponSkillCondition.HP,
    properties: {
        kind: p.enum([EWeaponSkillCondition.HP]),
        operand: p.enum(() => EWeaponSkillHpOperand),
        percentage: p.integer(),
    },
});
export class WeaponSkillHpCondition extends WeaponSkillHpConditionSchema.class implements IWeaponSkillHpCondition {}
WeaponSkillHpConditionSchema.setClass(WeaponSkillHpCondition);
