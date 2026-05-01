import { Weapon } from "../models.ts";

const weaponSearchHandler = {
    class: Weapon,
    response: (weapon: Weapon) => `**${weapon.name}** is a level ${weapon.level} ${weapon.weaponType.name}.`
} as const

export default weaponSearchHandler