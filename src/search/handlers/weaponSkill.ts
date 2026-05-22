import type { APIEmbed } from "discord.js";
import { WeaponSkill } from "../../game/models/weaponSkill.ts";
import type { IWeaponSkill, IWeaponTypeWeaponSkill } from "../../game/types.ts";
import type { ISearchHandler } from "../types.ts";

export function getWeaponTypeSkillRankString(rank: IWeaponTypeWeaponSkill["rank"], weaponTypeName: string): string {
    switch (rank) {
        case 1:
            return `Possessed by ${weaponTypeName} weapons of level 3.`;
        case 2:
            return `Possessed by ${weaponTypeName} weapons of level 5.`;
        case 3:
            return `Possessed by ${weaponTypeName} weapons of level 6, 7 and 8.`;
    }
}

const weaponSkillSearchHandler: ISearchHandler<WeaponSkill> = {
    class: WeaponSkill,
    response: (weaponSkill: IWeaponSkill) => {
        const weaponTypeSkillStr = Array.from(weaponSkill.weaponTypeWeaponSkills)
            .map((weaponTypeWeaponSkill) =>
                getWeaponTypeSkillRankString(weaponTypeWeaponSkill.rank, weaponTypeWeaponSkill.weaponType.name),
            )
            .join("\n");

        const uniqueSkillWeapons = Array.from(weaponSkill.uniqueSkillWeapons)
            .map((weapon) => weapon.name)
            .join(", ");

        const fields: APIEmbed["fields"] = [
            {
                name: "Effect",
                value: weaponSkill.description,
                inline: true,
            },
            ...(weaponTypeSkillStr.length > 0
                ? [
                    {
                        name: "Weapon Type Skill",
                        value: weaponTypeSkillStr,
                    },
                ]
                : []),
            ...(uniqueSkillWeapons.length > 0
                ? [
                    {
                        name: "Unique skill for weapon(s)",
                        value: uniqueSkillWeapons,
                    },
                ]
                : []),
        ];
        return {
            title: weaponSkill.name,
            fields: fields,
        };
    },
} as const;

export default weaponSkillSearchHandler;
