import { hyperlink, unorderedList, type APIEmbed } from "discord.js";
import { DISCIPLE_MAXIXUM_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../../game/constants.ts";
import { Disciple } from "../../game/models/disciple.ts";
import { describeSpellEffects } from "../../game/spellEffectDescriptions/spell.ts";
import type { IDisciple, IMusic } from "../../game/types.ts";
import range from "../../utils/range.ts";
import { toAsciiTable } from "../../utils/table.ts";
import { SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA } from "../constants.ts";
import type { ISearchHandler } from "../types.ts";

export function getDiscipleBaseStatsTable(disciple: Pick<IDisciple, "getHp" | "getAtk">): (string | number)[][] {
    const relevantLevels = Array.from(
        range({ start: DISCIPLE_MINIMUM_RELEVANT_LEVEL, end: DISCIPLE_MAXIXUM_LEVEL + 1 }),
    );
    return [
        ["Level", 1, ...relevantLevels],
        ["HP", disciple.getHp({ level: 1 }), ...relevantLevels.map((level) => disciple.getHp({ level }))],
        ["Atk", disciple.getAtk({ level: 1 }), ...relevantLevels.map((level) => disciple.getAtk({ level }))],
    ];
}

function formatShadowMusicStrValue(music: IMusic) {
    return music.url
        ? hyperlink(music.name, music.url)
        : `${music.name}\n  ${SEARCH_MUSIC_HANDLE_NO_KNOWN_SOURCE_MEDIA}`;
}

const discipleSearchHandler: ISearchHandler<Disciple> = {
    class: Disciple,
    message: (disciple: IDisciple) => {
        const spellsStr = [...disciple.spells]
            .map((spell) => `- **${spell.name}**: ${describeSpellEffects(spell, true)}`)
            .join("\n");

        const baseStatsTable = getDiscipleBaseStatsTable(disciple);
        const baseStatsTableAscii = toAsciiTable({ data: baseStatsTable, cellPadding: 3 });
        const baseStatsStr = `\`\`\`\n${baseStatsTableAscii}\n\`\`\``;

        const shadowMusicStr = unorderedList([
            formatShadowMusicStrValue(disciple.shadowMusic),
            formatShadowMusicStrValue(disciple.shadowResultsScreenMusic),
        ]);

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
                name: "Shadow music",
                value: shadowMusicStr,
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
            reply: {
                embed: {
                    title: disciple.name,
                    fields,
                },
            },
        };
    },
} as const;

export default discipleSearchHandler;
