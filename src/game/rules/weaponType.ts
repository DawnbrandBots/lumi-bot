import type { DeepPick } from "../../utils/types.ts";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER } from "../constants.ts";
import type { IWeaponType } from "../types.ts";

/** Calculates the disciple base Atk modifier granted by a weapon type's range. */

export function discipleBaseAtkModifier(weaponTypeData: DeepPick<IWeaponType, { range: true }>): number {
    return WEAPON_TYPE_RANGE_ATK_MODIFIER[weaponTypeData.range];
}

const WeaponType = {
    discipleBaseAtkModifier,
};

export default WeaponType;
