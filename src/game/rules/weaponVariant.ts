import type { DeepPick } from "../../utils/types.ts";
import { WEAPON_VARIANTS_BONUSES } from "../constants.ts";
import type { IWeapon, IWeaponVariant } from "../types.ts";

export const WEAPON_VARIANTS = {
    HP: { kind: "HP", ...WEAPON_VARIANTS_BONUSES.HP },
    NEUTRAL: { kind: "NEUTRAL", ...WEAPON_VARIANTS_BONUSES.NEUTRAL },
    ATK: { kind: "ATK", ...WEAPON_VARIANTS_BONUSES.ATK },
} satisfies Record<IWeaponVariant["kind"], IWeaponVariant>;

export function stat(
    arg: {
        weaponData: DeepPick<IWeapon, { level: true; hp: true; atk: true }>;
        weaponVariantData: DeepPick<IWeaponVariant, { hp: true; atk: true }>;
    } & Parameters<IWeapon["getWeaponVariantStat"]>[0],
): number {
    return arg.weaponData.level === 1 ? 0 : arg.weaponData[arg.stat] + arg.weaponVariantData[arg.stat];
}

const WeaponVariant = {
    stat,
};

export default WeaponVariant;
