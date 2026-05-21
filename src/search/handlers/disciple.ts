import type { APIEmbed } from "discord.js";
import { DISCIPLE_MAXIXUM_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../../game/constants.ts";
import { Disciple } from "../../game/models/disciple.ts";
import type { IDisciple } from "../../game/types.ts";
import range from "../../utils/range.ts";
import { toAsciiTable } from "../../utils/table.ts";
import type { ISearchHandler } from "../types.ts";

export function getDiscipleBaseStatsTable(disciple: IDisciple): (string | number)[][] {
    const relevantLevels = Array.from(
        range({ start: DISCIPLE_MINIMUM_RELEVANT_LEVEL, end: DISCIPLE_MAXIXUM_LEVEL + 1 }),
    );
    return [
        ["Level", 1, ...relevantLevels],
        ["HP", disciple.getHp({ level: 1 }), ...relevantLevels.map((level) => disciple.getHp({ level }))],
        ["Atk", disciple.getAtk({ level: 1 }), ...relevantLevels.map((level) => disciple.getAtk({ level }))],
    ];
}

const discipleSearchHandler: ISearchHandler<Disciple> = {
    class: Disciple,
    response: (disciple: IDisciple) => {
        const spellsStr = [...disciple.spells].map((spell) => `- ${spell.name}`).join("\n");

        const baseStatsTable = getDiscipleBaseStatsTable(disciple);
        const baseStatsTableAscii = toAsciiTable({ data: baseStatsTable, cellPadding: 3 });
        const baseStatsStr = `\`\`\`\n${baseStatsTableAscii}\n\`\`\``;

        const fields: NonNullable<APIEmbed["fields"]> = [
            {
                name: "Weapon Type",
                value: disciple.weaponType.name,
                inline: true,
            },
            {
                name: "Movement Type",
                value: disciple.movementType.name,
                inline: true,
            },
            {
                name: "PRF Weapon",
                value: disciple.prfWeapon.name,
                inline: true,
            },
            {
                name: "Spells",
                value: spellsStr,
            },
            {
                name: "Base stats",
                value: baseStatsStr,
            },
        ];

        return {
            title: disciple.name,
            fields,
        };
    },
} as const;

export default discipleSearchHandler;
