import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    EWeaponSkillCondition,
    type IWeaponSkillFoeCondition,
} from "../../../../../domain/game/models/weaponSkillEffect.types.ts";
import { UNIT_SELECTORS } from "./shared.ts";
import { WeaponSkillCondition } from "./weaponSkillCondition.ts";

export const WeaponSkillFoeConditionSchema = defineEntity({
    name: "WeaponSkillFoeCondition",
    embeddable: true,
    extends: WeaponSkillCondition,
    discriminatorValue: EWeaponSkillCondition.FOE,
    properties: {
        kind: p.enum([EWeaponSkillCondition.FOE]),
        foeSelector: () => p.embedded(UNIT_SELECTORS).object(),
    },
});
export class WeaponSkillFoeCondition extends WeaponSkillFoeConditionSchema.class implements IWeaponSkillFoeCondition {}
WeaponSkillFoeConditionSchema.setClass(WeaponSkillFoeCondition);
