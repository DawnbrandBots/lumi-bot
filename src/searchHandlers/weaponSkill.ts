import { APIEmbed } from "discord.js";
import { SearchHandler } from "../features/search.ts";
import { WeaponSkill } from "../models/game/classes/weaponSkill.ts";
import { IWeaponSkill } from "../models/game/types.ts";

const weaponSkillSearchHandler: SearchHandler<WeaponSkill> = {
    class: WeaponSkill,
    // TODO: no join operator on iterators yet :( (https://github.com/tc39/proposal-iterator-join)
    response: (weaponSkill: IWeaponSkill) => {
        const weapons = Array.from(weaponSkill.weapons)
            .map((weapon) => weapon.name)
            .join(", ");
        const fields: APIEmbed["fields"] = [
            {
                name: "Effect",
                value: weaponSkill.description,
                inline: true,
            },
            {
                name: "Weapons",
                value: weapons,
            },
        ];
        return {
            title: weaponSkill.name,
            fields: fields,
        };
    },
} as const;

export default weaponSkillSearchHandler;
