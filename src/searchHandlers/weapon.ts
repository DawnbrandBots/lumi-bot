import { APIEmbed } from "discord.js";
import { SearchHandler } from "../features/search.ts";
import { Weapon } from "../models.ts";
import { IWeapon } from "../types.ts";

const weaponSearchHandler: SearchHandler<Weapon> = {
    class: Weapon,
    response: (weapon: IWeapon) => {
        const exclusivity = weapon.prfDisciple && {
            name: "Exclusive to",
            value: weapon.prfDisciple.name,
            inline: true,
        }

        const fields: APIEmbed["fields"] = [
            {
                name: "Level",
                value: weapon.level + "",
                inline: true,
            },
            {
                name: "Weapon Type",
                value: weapon.weaponType.name,
                inline: true,
            },
            ...(exclusivity ? [exclusivity] : [])
        ]
        return {
            title: weapon.name,
            fields: fields
        }
    }
} as const

export default weaponSearchHandler