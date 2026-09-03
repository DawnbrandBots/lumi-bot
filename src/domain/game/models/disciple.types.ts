import type { TId } from "./base.types.ts";
import type { IMovementType } from "./movement.types.ts";
import type { IMusic } from "./music.types.ts";
import type { ISpell } from "./spell.types.ts";
import type { IWeapon } from "./weapon.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

/** An unlockable character. */
export interface IDisciple {
    readonly kind: "disciple";
    readonly id: TId;
    readonly name: string;
    readonly epithet: string;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    /** All disciples have one weapon that only they can equip. */
    readonly prfWeapon: IWeapon;
    /** Music that plays when this disciple is revealed to be the Shadow. */
    readonly shadowMusic: IMusic;
    /** Music that plays when this disciple the Shadow and the battle is over. */
    readonly shadowResultsScreenMusic: IMusic;
    /** Spells this disciple provides as their souls are collected. */
    readonly spells: Iterable<ISpell>;
    /** Atk value at level 1. */
    readonly baseAtk: number;
    /** HP value at level 1. */
    readonly baseHp: number;
    /** @returns Atk value for the given level. */
    getAtk({ level }: { level: number }): number;
    /** @returns HP value for the given level. */
    getHp({ level }: { level: number }): number;
}
