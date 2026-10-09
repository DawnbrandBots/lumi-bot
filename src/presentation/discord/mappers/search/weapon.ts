import { bold, italic, unorderedList, type APIEmbed } from "discord.js";
import type { IWeapon } from "../../../../domain/game/models/weapon.types.ts";
import { toAsciiTable } from "../../../../utils/table.ts";

export default function mapWeaponToMessage(weapon: IWeapon) {
    const introStr = `Level ${weapon.level} ${weapon.weaponType.name}${weapon.prfDisciple ? `, exclusive to ${weapon.prfDisciple.name}` : ""}`;

    const statsTable = [
        ["Variant", "Atk", "(-)", "HP"],
        [
            "HP",
            weapon.getWeaponVariantStat({ stat: "hp", variant: "ATK" }),
            weapon.getWeaponVariantStat({ stat: "hp", variant: "NEUTRAL" }),
            weapon.getWeaponVariantStat({ stat: "hp", variant: "HP" }),
        ],
        [
            "Atk",
            weapon.getWeaponVariantStat({ stat: "atk", variant: "ATK" }),
            weapon.getWeaponVariantStat({ stat: "atk", variant: "NEUTRAL" }),
            weapon.getWeaponVariantStat({ stat: "atk", variant: "HP" }),
        ],
    ];
    const statsTableAscii = toAsciiTable({ data: statsTable, cellPadding: 3 });
    const statsTableStr = `\`\`\`\n${statsTableAscii}\n\`\`\``;

    const skillsStr = unorderedList(
        [
            weapon.weaponTypeSkill && `${bold(weapon.weaponTypeSkill.name)}: ${weapon.weaponTypeSkill.description}`,
            weapon.uniqueSkill && `${bold(weapon.uniqueSkill.name)}: ${weapon.uniqueSkill.description}`,
            weapon.freeSkillSlots > 0
                ? `${weapon.freeSkillSlots} free skill slot${weapon.freeSkillSlots !== 1 ? "s" : ""}`
                : italic(`No free skill slots`),
        ].filter((s) => s != null),
    );

    const fields: APIEmbed["fields"] = [
        {
            name: "Skills",
            value: skillsStr,
        },
        {
            name: "Stats",
            value: statsTableStr,
        },
    ];
    return {
        reply: {
            embed: {
                title: weapon.name,
                description: introStr,
                fields: fields,
            },
        },
    };
}
