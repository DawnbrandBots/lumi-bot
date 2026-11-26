import type { APIEmbedField } from "discord.js";
import { codeBlock, italic, type APIEmbed } from "discord.js";
import {
    ESpellDraggingModeKind,
    ESpellCastKind,
    ESpellRole,
    type ISpell,
    type TSpellCast,
} from "../../../../domain/game/models/spell.types.ts";
import range from "../../../../utils/range.ts";
import { toAsciiTable } from "../../../../utils/table.ts";
import { describeSpellEffects, formatSpellCooldown } from "./spellEffectDescriptions.ts";
import spellEffectValues, { type ISpellEffectValueWithToLevel } from "./spellEffectValues.ts";

function formatSpellTargeting(cast: TSpellCast) {
    if (cast.kind === ESpellCastKind.NORMAL) {
        return {
            shape: `targets ${cast.shape.name}`,
            draggingMode: cast.draggingMode === ESpellDraggingModeKind.SELF ? "self-targeting" : undefined,
        };
    }

    const lightSelf = cast.light.draggingMode === ESpellDraggingModeKind.SELF;
    const shadowSelf = cast.shadow.draggingMode === ESpellDraggingModeKind.SELF;
    return {
        shape:
            cast.light.shape.id === cast.shadow.shape.id
                ? `targets ${cast.light.shape.name}`
                : `targets ${cast.light.shape.name} (Light form), ${cast.shadow.shape.name} (Shadow form)`,
        draggingMode:
            lightSelf === shadowSelf
                ? lightSelf
                    ? "self-targeting"
                    : undefined
                : `self-targeting (${lightSelf ? "light" : "shadow"} form only)`,
    };
}

function formatInnerTableRows(arg: {
    values: ISpellEffectValueWithToLevel[][];
    levelsRow: number[];
    indexFormat: (index: number) => string;
}) {
    return arg.values.flatMap((values, index) => {
        return values.map((value, valueIndex) => [
            valueIndex === 0 ? arg.indexFormat(index + 1) : "",
            ...arg.levelsRow.map((level, index) => (!value.scalesWithLevel && index > 0 ? "." : value.toLevel(level))),
        ]);
    });
}

function getSpellEffectValues(cast: TSpellCast) {
    return cast.kind === ESpellCastKind.NORMAL
        ? { kind: cast.kind, effects: cast.effects.map(spellEffectValues) }
        : {
              kind: cast.kind,
              light: cast.light.effects.map(spellEffectValues),
              shadow: cast.shadow.effects.map(spellEffectValues),
          };
}

function formatSpellValues({
    spell,
    values,
}: {
    spell: ISpell;
    values: ReturnType<typeof getSpellEffectValues>;
}): [APIEmbedField, APIEmbedField] | [APIEmbedField] {
    const innerTable = (rangeArg: { start: number; end: number }) => {
        const levelsRow = Array.from(range(rangeArg));
        const rows =
            values.kind === ESpellCastKind.NORMAL
                ? formatInnerTableRows({
                      values: values.effects,
                      levelsRow,
                      indexFormat: (index) => `${index}.`,
                  })
                : [
                      ...formatInnerTableRows({
                          values: values.light,
                          levelsRow,
                          indexFormat: (index) => `L${index}`,
                      }),
                      ...formatInnerTableRows({
                          values: values.shadow,
                          levelsRow,
                          indexFormat: (index) => `S${index}`,
                      }),
                  ];
        const data = [["", ...levelsRow], ...rows];
        return toAsciiTable({ data, cellPadding: 3, omitVerticalSeparator: true });
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

        // Values are split between two tables, each in an embed field of their own, so that the two tables can be displayed side by side on PC,
        // but stacked vertically on mobile.
        // It appears the two tables, side by side, as they are currently formatted, take just the right amount of horizontal space to fit in an embed on PC.
        return [
            { name: "Effects' values by level", value: codeBlock(innerTable1), inline: true },
            // Empty or blank characters-only name would cause the title HTML element in embed field to disappear, not just exist and have an empty string as content.
            // On PC, this results in the field's value being lifted up, thus not aligning horizontally with the previous field's value.
            // On mobile, an empty name does NOT result in the value being lifted up, so no vertical space can be saved.
            { name: "-", value: codeBlock(innerTable2), inline: true },
        ];
    } else {
        return [{ name: "Effects' values by level", value: codeBlock(innerTable({ start: 1, end: 2 })) }];
    }
}

const SPELL_UNLOCK_INDEX_STRS = ["1st", "2nd", "3rd"];
const SPELL_ROLE_STR = {
    LIGHT: "Light",
    SHADOW: "Shadow",
};

function formatDiscipleSpellUnlock(spell: Pick<ISpell, "id" | "disciple" | "role">): string {
    if (!spell.disciple) {
        return italic("Spell not associated to any disciple");
    }

    const spellIndex = [...spell.disciple.spells].findIndex((s) => s.id === spell.id);
    const spellUnlockIndexStr = SPELL_UNLOCK_INDEX_STRS[spellIndex - 1];
    const roleStr =
        spell.role === ESpellRole.EX
            ? "EX"
            : `${spellUnlockIndexStr ? `${spellUnlockIndexStr} ` : ""}unlockable spell, ${SPELL_ROLE_STR[spell.role]} side`;
    return `${spell.disciple.name}'s ${roleStr}`;
}

export default function mapSpellToMessage(spell: ISpell) {
    const targeting = formatSpellTargeting(spell.cast);
    const propertiesStr = [
        `${spell.uses ? (spell.uses === 1 ? "Single use" : `${spell.uses} uses`) : "Infinite uses"}`,
        formatSpellCooldown({ cast: spell.cast, inline: false }),
        targeting.shape,
        spell.onlyFor ? `only for ${spell.onlyFor.name} units` : undefined,
        targeting.draggingMode,
    ]
        .filter(Boolean)
        .join(", ");

    const description = [formatDiscipleSpellUnlock(spell), propertiesStr].filter(Boolean).join("\n");

    const values = getSpellEffectValues(spell.cast);
    const valuesFields =
        (values.kind === ESpellCastKind.FORM_BASED
            ? values.light.some((valuesSubArray) => valuesSubArray.length) ||
              values.shadow.some((valuesSubArray) => valuesSubArray.length)
            : values.effects.some((valuesSubArray) => valuesSubArray.length)) && formatSpellValues({ spell, values });
    const effectsStr = describeSpellEffects(spell);

    const fields: APIEmbed["fields"] = [
        {
            name: "Effects",
            value: effectsStr,
        },
        ...(valuesFields ? valuesFields : []),
    ];

    return {
        reply: {
            embed: {
                title: spell.name,
                description,
                fields,
            },
        },
    };
}
