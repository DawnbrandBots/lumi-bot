import { codeBlock, type APIEmbed } from "discord.js";
import {
    DISCORD_BLACK_SQUARE_EMOJI_CALL,
    DISCORD_BLUE_SQUARE_EMOJI_CALL,
    DISCORD_RED_SQUARE_EMOJI_CALL,
} from "../../bot/constants.ts";
import { describeSpellEffects } from "../../game/spellEffectDescriptions.ts";
import { spellEffectsValues } from "../../game/spellEffectValues.ts";
import type { ISpell } from "../../game/types.ts";
import range from "../../utils/range.ts";
import { toAsciiTable } from "../../utils/table.ts";

const tileEmojis: Record<string, string> = {
    X: DISCORD_RED_SQUARE_EMOJI_CALL,
    O: DISCORD_BLUE_SQUARE_EMOJI_CALL,
    ".": DISCORD_BLACK_SQUARE_EMOJI_CALL,
};

function formatSpellValues(spell: ISpell): string | null {
    const innerTable = (rangeArg: { start: number; end: number }) => {
        const levelsRow = Array.from(range(rangeArg));
        const rows = spellEffectsValues(spell).flatMap((values, index) => {
            return values.map((value, valueIndex) => [
                valueIndex === 0 ? `${index + 1}.` : "",
                ...levelsRow.map((level) => value.toLevel(level)),
            ]);
        });
        const data = [["Lv", ...levelsRow], ...rows];
        return toAsciiTable({ data, cellPadding: 3 });
    };

    const innerTable1 = innerTable({
        start: 1,
        end: 7,
    });
    const innerTable2 = innerTable({
        start: 7,
        end: 13,
    });

    return codeBlock(innerTable1 + "\n" + " ".repeat(innerTable1.indexOf("\n")) + "\n" + innerTable2);
}

export default function mapSpellToMessage(spell: ISpell) {
    const shapeStr = spell.shape.tiles
        .replaceAll(/(.{5})(?<!$)/g, "$1\n")
        .replaceAll(/./g, (tile) => tileEmojis[tile] ?? tile);

    const valuesStr = formatSpellValues(spell);
    const effectsStr = describeSpellEffects(spell);

    const onlyFor = spell.onlyFor && {
        name: "Only for",
        value: `${spell.onlyFor.name} units`,
        inline: true,
    };

    const fields: APIEmbed["fields"] = [
        {
            name: "Disciple",
            value: spell.disciple?.name || "*None*",
            inline: true,
        },
        {
            name: "Role",
            value: spell.role.name,
            inline: true,
        },
        {
            name: "Uses",
            value: !spell.uses ? "Infinite" : spell.uses + "",
            inline: true,
        },
        {
            name: "Cooldown",
            value: spell.cooldown + " seconds",
            inline: true,
        },
        {
            name: "Dragging mode",
            value: spell.draggingMode.asString,
            inline: true,
        },
        ...(onlyFor ? [onlyFor] : []),
        // Shape and effects are separated because they may
        // take a lot of vertical space compared to other fields.
        { name: "", value: "" },
        {
            name: "Shape",
            value: shapeStr,
            inline: true,
        },
        {
            name: "Effects",
            value: effectsStr,
            inline: true,
        },
        ...(valuesStr
            ? [
                  {
                      name: "Values",
                      value: valuesStr,
                  },
              ]
            : []),
    ];

    return {
        reply: {
            embed: {
                title: spell.name,
                fields,
            },
        },
    };
}
