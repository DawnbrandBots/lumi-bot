import type { APIEmbed } from "discord.js";
import { DISCIPLE_MAXIXUM_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../../game/constants.ts";
import { Disciple } from "../../game/models/disciple.ts";
import type { IDisciple } from "../../game/types.ts";
import { toAsciiTable } from "../../utils/table.ts";
import type { ISearchHandler } from "../types.ts";

const discipleSearchHandler: ISearchHandler<Disciple> = {
    class: Disciple,
    response: (disciple: IDisciple) => {
        const spellsStr = [...disciple.spells].map((spell) => `- ${spell.name}`).join("\n");

        const columnCountAsideFromHeaderAndLevel1 = DISCIPLE_MAXIXUM_LEVEL - DISCIPLE_MINIMUM_RELEVANT_LEVEL + 1;
        const baseStatsTable = [
            [
                "Level",
                1,
                ...Array.from(
                    { length: columnCountAsideFromHeaderAndLevel1 },
                    (_, i) => i + DISCIPLE_MINIMUM_RELEVANT_LEVEL,
                ),
            ],
            [
                "HP",
                disciple.getHp({ level: 1 }),
                ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) =>
                    disciple.getHp({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }),
                ),
            ],
            [
                "Atk",
                disciple.getAtk({ level: 1 }),
                ...Array.from({ length: columnCountAsideFromHeaderAndLevel1 }, (_, i) =>
                    disciple.getAtk({ level: i + DISCIPLE_MINIMUM_RELEVANT_LEVEL }),
                ),
            ],
        ];
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
