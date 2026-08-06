import type { PickDeep } from "type-fest";
import type { IWeapon, IWeaponSkill } from "../types.ts";

export function weaponTypeSkill(
    arg: PickDeep<IWeapon, "level" | "weaponType.weaponSkills">,
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
