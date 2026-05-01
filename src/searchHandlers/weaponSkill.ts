import { WeaponSkill } from "../models.ts";
import { IWeaponSkill } from "../types.ts";

const weaponSkillSearchHandler = {
    class: WeaponSkill,
    // TODO: no join operator on iterators yet :( (https://github.com/tc39/proposal-iterator-join)
    response: (weaponSkill: IWeaponSkill) => `**${weaponSkill.name}**: ${weaponSkill.description}\nWeapons: ${Array.from(weaponSkill.weapons).map(weapon => weapon.name).join(", ")}`
} as const

export default weaponSkillSearchHandler