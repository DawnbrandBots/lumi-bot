import type { APIEmbed } from "discord.js";
import { bold, codeBlock, hyperlink, italic, unorderedList } from "discord.js";
import { DISCIPLE_MAXIXUM_LEVEL, DISCIPLE_MINIMUM_RELEVANT_LEVEL } from "../../../../domain/game/constants.ts";
import type { IDisciple } from "../../../../domain/game/models/disciple.types.ts";
import type { IMusic } from "../../../../domain/game/models/music.types.ts";
import range from "../../../../utils/range.ts";
import { toAsciiTable } from "../../../../utils/table.ts";
import { describeSpellEffects } from "./spellEffectDescriptions.ts";

import { createHash } from "node:crypto";

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

function formatShadowMusicStrValue(music: Pick<IMusic, "name" | "url">) {
    return music.url ? hyperlink(music.name, music.url) : music.name;
}

export default function mapDiscipleToMessage(disciple: IDisciple) {
    const typesStr = `${disciple.weaponType.name} ${disciple.movementType.name} disciple`;

    const shadowMusicStr = `${bold("Theme")}: ${formatShadowMusicStrValue(disciple.shadowMusic)}${disciple.shadowResultsScreenMusic.url ? ` (${formatShadowMusicStrValue({ name: "results screen", url: disciple.shadowResultsScreenMusic.url })})` : ""}`;

    const supports = [...disciple.supports];
    const supportsStr =
        supports.length > 0
            ? `${bold("Supports")}: ${supports.map(({ name }) => name).join(", ")}`
            : italic("This disciple has no supports");
    const prfStr = `${bold("PRF")}: ${disciple.prfWeapon.name}`;

    const spellsStr = unorderedList(
        [...disciple.spells].map((spell) => `${bold(spell.name)}: ${describeSpellEffects(spell, true)}`),
    );

    const baseStatsTable = getDiscipleBaseStatsTable(disciple);
    const baseStatsTableAscii = toAsciiTable({ data: baseStatsTable, cellPadding: 3 });
    const baseStatsStr = codeBlock(baseStatsTableAscii);

    const title = `${disciple.name}, ${disciple.epithet}`;
    const description = [typesStr, prfStr, shadowMusicStr, supportsStr].join("\n");
    const fields = [
        {
            name: "Spells",
            value: spellsStr,
            inline: false,
        },
        {
            name: "Base stats",
            value: baseStatsStr,
            inline: false,
        },
    ];

    // TODO: switch between portraits
    const portraitName = `FESH_${disciple.name}_${disciple.epithet.replace(" ", "_")}_shadow.jpg`;
    const hash = createHash("md5").update(portraitName).digest("hex");
    const url = `https://cdn.fireemblemwiki.org/${hash[0]}/${hash.slice(0, 2)}/${portraitName}`;

    return {
        reply: {
            embed: {
                title,
                description,
                fields,
                thumbnail: { url },
            } satisfies APIEmbed,
        },
    };
}
