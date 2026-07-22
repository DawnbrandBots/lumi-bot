import type { DeepPick } from "../../utils/types.ts";
import { WEAPON_TYPE_RANGE_ATK_MODIFIER } from "../constants.ts";
import type { IWeapon, IWeaponSkill, IWeaponType } from "../types.ts";

/** Calculates the disciple base Atk modifier granted by a weapon type's range. */
export function typeDiscipleBaseAtkModifier(weaponTypeData: DeepPick<IWeaponType, { range: true }>): number {
    return WEAPON_TYPE_RANGE_ATK_MODIFIER[weaponTypeData.range];
}

/** Selects the weapon type skill unlocked by a weapon's level. */
export function weaponTypeSkill(
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

/** Domain rules for weapons and weapon types. */
const Weapon = {
    typeDiscipleBaseAtkModifier,
    weaponTypeSkill,
};

export default Weapon;
