import { codeBlock, type APIEmbed } from "discord.js";
import {
    DISCORD_BLACK_SQUARE_EMOJI_CALL,
    DISCORD_BLUE_SQUARE_EMOJI_CALL,
    DISCORD_RED_SQUARE_EMOJI_CALL,
} from "../../bot/constants.ts";
import { Spell } from "../../game/models/spell.ts";
import { describeSpellEffects } from "../../game/spellEffectDescriptions.ts";
import { spellEffectsValues } from "../../game/spellEffectValues.ts";
import type { ISpell } from "../../game/types.ts";
import range from "../../utils/range.ts";
import { separator, toAsciiTable } from "../../utils/table.ts";
import type { ISearchHandler } from "../types.ts";

const tileEmojis: Record<string, string> = {
    X: DISCORD_RED_SQUARE_EMOJI_CALL,
    O: DISCORD_BLUE_SQUARE_EMOJI_CALL,
    ".": DISCORD_BLACK_SQUARE_EMOJI_CALL,
};

// const SPELL_VALUE_LEVELS = Array.from(range({ start: 1, end: 13 }));

const SPELL_VALUE_LEVELS_ROW_1 = Array.from(range({ start: 1, end: 7 }));
const SPELL_VALUE_LEVELS_ROW_2 = Array.from(range({ start: 7, end: 13 }));

function formatSpellValues(spell: ISpell): string | null {
    // const rows = spellEffectsValues(spell).flatMap((values, index) => {
    //     return values.map((value, valueIndex) => [
    //         valueIndex === 0 ? index + 1 : "",
    //         value.scale,
    //         ...SPELL_VALUE_LEVELS.map((level) => value.toLevel(level)),
    //     ]);
    // });

    // if (!rows.length) {
    //     return null;
    // }

    // return codeBlock(
    //     toAsciiTable({
    //         data: [["", "Scl", ...SPELL_VALUE_LEVELS], ...rows],
    //         cellPadding: 3,
    //     }),
    // );

    //////////

    // const rows1 = spellEffectsValues(spell).flatMap((values, index) => {
    //     return values.map((value, valueIndex) => [
    //         valueIndex === 0 ? index + 1 : "",
    //         value.scale,
    //         ...SPELL_VALUE_LEVELS_ROW_1.map((level) => value.toLevel(level)),
    //     ]);
    // });

    // const rows2 = spellEffectsValues(spell).flatMap((values, index) => {
    //     return values.map((value, valueIndex) => [
    //         valueIndex === 0 ? index + 1 : "",
    //         value.scale,
    //         ...SPELL_VALUE_LEVELS_ROW_2.map((level) => value.toLevel(level)),
    //     ]);
    // });

    // if (!rows1.length || !rows2.length) {
    //     return null;
    // }

    // return [
    //     codeBlock(
    //         toAsciiTable({
    //             data: [["", "Scl", ...SPELL_VALUE_LEVELS_ROW_1], ...rows1],
    //             cellPadding: 3,
    //         }),
    //     ),
    //     codeBlock(
    //         toAsciiTable({
    //             data: [["", "Scl", ...SPELL_VALUE_LEVELS_ROW_2], ...rows2],
    //             cellPadding: 3,
    //         }),
    //     ),
    // ].join("\n");

    //////////

    const rows1 = spellEffectsValues(spell).flatMap((values, index) => {
        return values.map((value, valueIndex) => [
            valueIndex === 0 ? index + 1 : "",
            ...SPELL_VALUE_LEVELS_ROW_1.map((level) => value.toLevel(level)),
        ]);
    });

    const rows2 = spellEffectsValues(spell).flatMap((values, index) => {
        return values.map((value, valueIndex) => [
            valueIndex === 0 ? index + 1 : "",
            ...SPELL_VALUE_LEVELS_ROW_2.map((level) => value.toLevel(level)),
        ]);
    });

    if (!rows1.length || !rows2.length) {
        return null;
    }

    return codeBlock(
        toAsciiTable({
            data: [["", ...SPELL_VALUE_LEVELS_ROW_1], ...rows1],
            cellPadding: 3,
        }) +
        "\n" +
        separator({ data: [["", ...SPELL_VALUE_LEVELS_ROW_1], ...rows1], cellPadding: 3, cross: "╪", line: "=" }) +
        "\n" +
        toAsciiTable({
            data: [["", ...SPELL_VALUE_LEVELS_ROW_2], ...rows2],
            cellPadding: 3,
        }),
    );
}

const populate = ["*"] as const;
const spellSearchHandler: ISearchHandler<Spell, (typeof populate)[number]> = {
    class: Spell,
    populate,
    message: (spell: ISpell) => {
        const shapeStr = spell.shape.tiles
            .replaceAll(/(.{5})(?<!$)/g, "$1\n")
            .replaceAll(/./g, (tile) => tileEmojis[tile] ?? tile);

        const effectsStr = describeSpellEffects(spell);
        const valuesStr = formatSpellValues(spell);

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
            title: spell.name,
            fields,
        };
    },
} as const;

export default spellSearchHandler;
