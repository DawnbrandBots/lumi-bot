import { Weapon } from "../models.ts";
import { IWeapon } from "../types.ts";

const weaponSearchHandler = {
    class: Weapon,
    response: (weapon: IWeapon) => `**${weapon.name}** is a level ${weapon.level} ${weapon.weaponType.name}.`
} as const

export default weaponSearchHandler