import type { IDisciple } from "../../game/models/disciple.types.ts";
import type { IWeapon } from "../../game/models/weapon.types.ts";
import type { EWeaponVariant } from "../../game/models/weaponVariant.types.ts";

export interface IWeaponListableItem {
    readonly kind: "weapon";
    readonly weapon: Pick<IWeapon, "id" | "name">;
    readonly variant: (typeof EWeaponVariant)[keyof typeof EWeaponVariant];
}
export interface ISoulListableItem {
    readonly kind: "soul";
    readonly disciple: Pick<IDisciple, "id" | "name">;
}

export type TListableItem = IWeaponListableItem | ISoulListableItem;
