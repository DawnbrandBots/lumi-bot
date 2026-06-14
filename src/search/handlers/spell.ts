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
import { toAsciiTable } from "../../utils/table.ts";
import type { ISearchHandler } from "../types.ts";

const tileEmojis: Record<string, string> = {
    X: DISCORD_RED_SQUARE_EMOJI_CALL,
    O: DISCORD_BLUE_SQUARE_EMOJI_CALL,
    ".": DISCORD_BLACK_SQUARE_EMOJI_CALL,
};

const SPELL_VALUE_LEVELS = Array.from(range({ start: 1, end: 13 }));

function formatSpellValues(spell: ISpell): string | null {
    const columns = spellEffectsValues(spell).flatMap((values, index) => {
        return values.map((value, valueIndex) => ({
            header: valueIndex === 0 ? index + 1 : "",
            value,
        }));
    });

    if (!columns.length) {
        return null;
    }

    return codeBlock(
        toAsciiTable({
            data: [
                ["Level", ...columns.map(({ header }) => header)],
                ["Scale", ...columns.map(({ value }) => value.scale)],
                ...SPELL_VALUE_LEVELS.map((level) => [level, ...columns.map(({ value }) => value.toLevel(level))]),
            ],
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
