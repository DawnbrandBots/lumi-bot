import type { TId } from "./base.types.ts";
import type { IColor } from "./color.types.ts";
import type { IWeaponSkill } from "./weaponSkill.types.ts";

/**
 * The kind of weapons a unit may wield. (eg. Sword, Lance, Axe...)
 */
export interface IWeaponType {
    readonly kind: "weaponType";
    readonly id: TId;
    readonly name: string;
    readonly color: IColor;
    /**
     * Number of tiles from which a unit may auto attack another one.
     */
    readonly range: 1 | 2;
    readonly weaponSkills: Iterable<IWeaponSkill>;
}
