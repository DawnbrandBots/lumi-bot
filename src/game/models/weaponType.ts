import { UnderscoreNamingStrategy, defineEntity, p } from "@mikro-orm/sqlite";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER } from "../constants.ts";
import type { IWeaponType } from "../types.ts";
import { Color } from "./color.ts";
import { WeaponSkill } from "./weaponSkill.ts";
import { WeaponTypeWeaponSkill } from "./weaponTypeWeaponSkill.ts";

// Prevent Mikro ORM from naming the weapon skills join table with plural.
const namingStrategy = new UnderscoreNamingStrategy();
const weaponTypeWeaponSkillPivotTable = namingStrategy.joinTableName(
    "weaponType" satisfies IWeaponType["kind"],
    WeaponSkill.name,
    "weaponSkill" satisfies WeaponSkill["kind"],
);

export const WeaponTypeSchema = defineEntity({
    name: "WeaponType",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        color: () => p.manyToOne(Color),
        range: p.enum([1, 2]),
        weaponSkills: () =>
            p
                .manyToMany(WeaponSkill)
                .pivotTable(weaponTypeWeaponSkillPivotTable)
                .pivotEntity(() => WeaponTypeWeaponSkill),
    },
});

export class WeaponType extends WeaponTypeSchema.class implements IWeaponType {
    get kind() {
        return "weaponType" as const;
    }

    get discipleBaseAtkModifier(): number {
        return WEAPON_TYPE_RANGE_ATK_MODIFIER[this.range];
    }
}
WeaponTypeSchema.setClass(WeaponType);
