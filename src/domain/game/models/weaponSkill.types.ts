import type { TId } from "./base.types.ts";
import type { IWeapon } from "./weapon.types.ts";
import type { IWeaponSkillEffect } from "./weaponSkillEffect.types.ts";
import type { IWeaponTypeWeaponSkill } from "./weaponTypeWeaponSkill.types.ts";

/** Passives that can be infused to weapons to influence stat and damage computations. */
export interface IWeaponSkill {
    readonly kind: "weaponSkill";
    readonly id: TId;
    readonly name: string;
    readonly effect: IWeaponSkillEffect;
    /** Weapons which possess this skill as a unique skill. */
    readonly uniqueSkillWeapons: Iterable<IWeapon>;
    readonly weaponTypeWeaponSkills: Iterable<IWeaponTypeWeaponSkill>;
    readonly description: string;
}
