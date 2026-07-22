import type { DeepPick } from "../../utils/types.ts";
import type { IWeapon, IWeaponSkill } from "../types.ts";

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

const Weapon = {
    weaponTypeSkill,
};

export default Weapon;
