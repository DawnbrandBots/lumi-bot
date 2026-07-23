import type { PickDeep } from "type-fest";
import { WEAPON_VARIANTS_BONUSES } from "../constants.ts";
import type { IWeapon, IWeaponVariant } from "../types.ts";
import { EWeaponVariant } from "../types.ts";

export const WEAPON_VARIANTS = {
    [EWeaponVariant.HP]: { kind: EWeaponVariant.HP, ...WEAPON_VARIANTS_BONUSES.HP },
    [EWeaponVariant.NEUTRAL]: { kind: EWeaponVariant.NEUTRAL, ...WEAPON_VARIANTS_BONUSES.NEUTRAL },
    [EWeaponVariant.ATK]: { kind: EWeaponVariant.ATK, ...WEAPON_VARIANTS_BONUSES.ATK },
} as const satisfies { [K in keyof typeof EWeaponVariant]: IWeaponVariant & { kind: K } };

export function stat(
    arg: {
        weaponData: PickDeep<IWeapon, "level" | "hp" | "atk">;
        weaponVariantData: PickDeep<IWeaponVariant, "hp" | "atk">;
    } & Parameters<IWeapon["getWeaponVariantStat"]>[0],
): number {
    return arg.weaponData.level === 1 ? 0 : arg.weaponData[arg.stat] + arg.weaponVariantData[arg.stat];
}

const WeaponVariant = {
    stat,
};

export default WeaponVariant;
