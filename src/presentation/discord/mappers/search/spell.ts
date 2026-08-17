import { codeBlock, type APIEmbed } from "discord.js";
import type { ISpell, ISpellShape } from "../../../../domain/game/models/spell.types.ts";
import { ESpellDraggingMode, ESpellRole } from "../../../../domain/game/models/spell.types.ts";
import range from "../../../../utils/range.ts";
import { toAsciiTable } from "../../../../utils/table.ts";
import {
    DISCORD_BLACK_SQUARE_EMOJI_CALL,
    DISCORD_BLUE_SQUARE_EMOJI_CALL,
    DISCORD_RED_SQUARE_EMOJI_CALL,
} from "../../constants.ts";
import { describeSpellEffects } from "./spellEffectDescriptions.ts";
import type { ISpellEffectValueWithToLevel } from "./spellEffectValues.ts";
import { spellEffectsValues } from "./spellEffectValues.ts";

const tileEmojis: Record<string, string> = {
    X: DISCORD_RED_SQUARE_EMOJI_CALL,
    O: DISCORD_BLUE_SQUARE_EMOJI_CALL,
    ".": DISCORD_BLACK_SQUARE_EMOJI_CALL,
};

export const SPELL_DRAGGING_MODE_DESCRIPTION_STRINGS = {
    ANY: "Any tile",
    SELF: "User tile only",
} as const satisfies Record<keyof typeof ESpellDraggingMode, string>;

export const SPELL_ROLE_DESCRIPTION_STRINGS = {
    EX: "EX",
    LIGHT: "Light",
    SHADOW: "Shadow",
} as const satisfies Record<keyof typeof ESpellRole, string>;

export function formatSpellShape(shape: Pick<ISpellShape, "tiles">): string {
    return shape.tiles.replaceAll(/(.{5})(?<!$)/g, "$1\n").replaceAll(/./g, (tile) => tileEmojis[tile] ?? tile);
}

function formatSpellValues({ spell, values }: { spell: ISpell; values: ISpellEffectValueWithToLevel[][] }): string {
    const innerTable = (rangeArg: { start: number; end: number }) => {
        const levelsRow = Array.from(range(rangeArg));
        const rows = values.flatMap((values, index) => {
            return values.map((value, valueIndex) => [
                valueIndex === 0 ? `${index + 1}.` : "",
                ...levelsRow.map((level, index) => (!value.scalesWithLevel && index > 0 ? "." : value.toLevel(level))),
            ]);
        });
        const data = [["Lv", ...levelsRow], ...rows];
        return toAsciiTable({ data, cellPadding: 3 });
    };

    if (spell.disciple) {
        const innerTable1 = innerTable({
            start: 1,
            end: 7,
        });
        const innerTable2 = innerTable({
            start: 7,
            end: 13,
        });

        return codeBlock(innerTable1 + "\n" + " ".repeat(innerTable1.indexOf("\n")) + "\n" + innerTable2);
    } else {
        return codeBlock(innerTable({ start: 1, end: 2 }));
    }
}

export default function mapSpellToMessage(spell: ISpell) {
    const shapeStr = formatSpellShape(spell.shape);

    const values = spellEffectsValues(spell);
    const valuesStr = values.some((valuesSubArray) => valuesSubArray.length) && formatSpellValues({ spell, values });
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
            value: SPELL_ROLE_DESCRIPTION_STRINGS[spell.role],
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
            value: SPELL_DRAGGING_MODE_DESCRIPTION_STRINGS[spell.draggingMode],
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
