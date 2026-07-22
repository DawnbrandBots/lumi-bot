import type { PickDeep } from "type-fest";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER } from "../constants.ts";
import type { IWeaponType } from "../types.ts";

export function discipleBaseAtkModifier(weaponTypeData: PickDeep<IWeaponType, "range">): number {
    return WEAPON_TYPE_RANGE_ATK_MODIFIER[weaponTypeData.range];
}

const WeaponType = {
    discipleBaseAtkModifier,
};

export default WeaponType;
