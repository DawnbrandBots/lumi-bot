import { APIEmbed } from "discord.js";
import { SearchHandler } from "../features/search.ts";
import { Weapon } from "../models.ts";
import { IWeapon } from "../types.ts";
import { toAsciiTable } from "../utils/table.ts";

// TODO: specifying "*" in the list will cause nested relationships to not be loaded, even when specifying these nested relationships.
// eg: ["*", "uniqueSkill.effect"] won't populate effect
// Is that even mentioned anywhere in the docs?
const populate = ["weaponType.*", "uniqueSkill.*", "prfDisciple.*"] as const
const weaponSearchHandler: SearchHandler<Weapon, typeof populate[number]> = {
    class: Weapon,
    populate: populate,
    response: (weapon: IWeapon) => {
        const statsTable = [
            ["Variant", "Atk", "(-)", "HP"],
            ["HP", weapon.getWeaponVariantStat({ stat: "hp", variant: "ATK" }), weapon.getWeaponVariantStat({ stat: "hp", variant: "NEUTRAL" }), weapon.getWeaponVariantStat({ stat: "hp", variant: "HP" })],
            ["Atk", weapon.getWeaponVariantStat({ stat: "atk", variant: "ATK" }), weapon.getWeaponVariantStat({ stat: "atk", variant: "NEUTRAL" }), weapon.getWeaponVariantStat({ stat: "atk", variant: "HP" })],
        ]
        const statsTableAscii = toAsciiTable({ data: statsTable, cellPadding: 3 })
        const statsTableStr = `\`\`\`\n${statsTableAscii}\n\`\`\``

        const exclusivity = weapon.prfDisciple && {
            name: "Exclusive to",
            value: weapon.prfDisciple.name,
            inline: true,
        }

        const uniqueSkill = weapon.uniqueSkill && {
            name: "Unique skill",
            value: `${weapon.uniqueSkill.name}: ${weapon.uniqueSkill.description}`,
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
            {
                name: "Free skill slots count",
                value: weapon.freeSkillSlots + "",
                inline: true,
            },
            ...(exclusivity ? [exclusivity] : []),
            ...(uniqueSkill ? [uniqueSkill] : []),
            {
                name: "Stats",
                value: statsTableStr,
            },
        ]
        return {
            title: weapon.name,
            fields: fields
        }
    }
} as const

export default weaponSearchHandler