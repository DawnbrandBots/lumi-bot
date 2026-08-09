import type { IWeaponSkill } from "./weaponSkill.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

// TODO: Actually represents a join table, not an in-game concept.
export interface IWeaponTypeWeaponSkill {
    readonly kind: "weaponTypeWeaponSkill";
    readonly weaponType: IWeaponType;
    readonly weaponSkill: IWeaponSkill;
    /**
     * Number in weapon type skill name (eg. 1 for "Armor Bane 1").
     */
    readonly rank: 1 | 2 | 3;
}
