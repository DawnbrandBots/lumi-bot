import type { DeepPick } from "../../utils/types.ts";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER, WEAPON_VARIANTS_BONUSES } from "../constants.ts";
import type { IWeapon, IWeaponType } from "../types.ts";

export function getWeaponTypeDiscipleBaseAtkModifier(weaponTypeData: DeepPick<IWeaponType, { range: true }>): number {
    return WEAPON_TYPE_RANGE_ATK_MODIFIER[weaponTypeData.range];
}

export function getWeaponVariantStat(
    arg: { weaponData: DeepPick<IWeapon, { level: true; hp: true; atk: true }> } & Parameters<
        IWeapon["getWeaponVariantStat"]
    >[0],
): number {
    return arg.weaponData.level === 1 ? 0 : arg.weaponData[arg.stat] + WEAPON_VARIANTS_BONUSES[arg.variant][arg.stat];
}

export function getWeaponTypeSkillRankByWeaponLevel(arg: DeepPick<IWeapon, { level: true }>): number | null {
    if (arg.level <= 1) {
        return null;
    } else if (arg.level <= 3) {
        return 0;
    } else if (arg.level <= 5) {
        return 1;
    } else {
        return 2;
    }
}
