import type { APIEmbed } from "discord.js";
import { WeaponSkill } from "../../game/models/weaponSkill.ts";
import type { IWeaponSkill } from "../../game/types.ts";
import type { ISearchHandler } from "../types.ts";

const weaponSkillSearchHandler: ISearchHandler<WeaponSkill> = {
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
