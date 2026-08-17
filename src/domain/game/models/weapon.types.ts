import type { TId } from "./base.types.ts";
import type { IDisciple } from "./disciple.types.ts";
import type { IWeaponSkill } from "./weaponSkill.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";
import type { EWeaponVariant } from "./weaponVariant.types.ts";

/**
 * A weapon that can be equipped by disciples.
 */
export interface IWeapon {
    readonly kind: "weapon";
    readonly id: TId;
    readonly name: string;
    readonly weaponType: IWeaponType;
    /**
     * Minimum level required by a disciple to wield this weapon.
     */
    readonly level: number;
    readonly hp: number;
    readonly atk: number;
    /**
     * Weapons of certain types have an immutable weapon skill.
     */
    readonly weaponTypeSkill?: IWeaponSkill | null;
    /**
     * Weapons may have a weapon skill that cannot be removed.
     */
    readonly uniqueSkill?: IWeaponSkill | null;
    /**
     * How many additional weapon skills may be infused to this weapon.
     */
    readonly freeSkillSlots: number;
    /**
     * Only disciple by which this weapon can be wielded.
     */
    readonly prfDisciple?: IDisciple | null;
    /**
     * A weapon has an immutable variant which influences the stats modifiers it grants to its wielder.
     *
     * @returns The value of the modifier for the given variant and stat.
     */
    getWeaponVariantStat(args: { variant: keyof typeof EWeaponVariant; stat: "hp" | "atk" }): number;
}
