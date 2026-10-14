import type { IMovementType } from "./movement.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

export const EUnitKind = {
    DISCIPLE: "DISCIPLE",
    MINION: "MINION",
} as const;

export type TUnitKind = (typeof EUnitKind)[keyof typeof EUnitKind];

export const EUnitRole = {
    LIGHT: "LIGHT",
    SHADOW: "SHADOW",
} as const;

export type TUnitRole = (typeof EUnitRole)[keyof typeof EUnitRole];

/** A character or other entity which can exist on the battlefield. */
export interface IUnit {
    readonly kind: TUnitKind;
    readonly role: TUnitRole;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
}
