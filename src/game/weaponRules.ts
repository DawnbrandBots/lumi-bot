import type { DeepPick } from "../utils/types.ts";
import { WEAPON_VARIANTS_BONUSES } from "./constants.ts";
import type { IWeapon, IWeaponSkill } from "./types.ts";

export function getWeaponVariantStat(
    arg: { weaponData: DeepPick<IWeapon, { level: true; hp: true; atk: true }> } & Parameters<
        IWeapon["getWeaponVariantStat"]
    >[0],
): number {
    return arg.weaponData.level === 1 ? 0 : arg.weaponData[arg.stat] + WEAPON_VARIANTS_BONUSES[arg.variant][arg.stat];
}

export function getWeaponTypeSkill(
    arg: DeepPick<IWeapon, { level: true; weaponType: { weaponSkills: true } }>,
): IWeaponSkill | null | undefined {
    const skills = Array.from(arg.weaponType.weaponSkills);
    if (arg.level <= 1) {
        return null;
    } else if (arg.level <= 3) {
        return skills[0];
    } else if (arg.level <= 5) {
        return skills[1];
    } else {
        return skills[2];
    }
}
