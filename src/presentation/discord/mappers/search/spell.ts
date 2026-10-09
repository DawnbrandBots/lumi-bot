import type { APIEmbedField } from "discord.js";
import { codeBlock, italic, type APIEmbed } from "discord.js";
import {
    ESpellDraggingModeKind,
    ESpellEffectsKind,
    ESpellRole,
    type ISpell,
} from "../../../../domain/game/models/spell.types.ts";
import range from "../../../../utils/range.ts";
import { toAsciiTable } from "../../../../utils/table.ts";
import { describeSpellEffects } from "./spellEffectDescriptions.ts";
import type { ISpellEffectValueWithToLevel } from "./spellEffectValues.ts";
import { spellEffectsValues } from "./spellEffectValues.ts";

function formatSpellDraggingMode(draggingMode: ISpell["draggingMode"]): string | null {
    if (draggingMode.kind === ESpellEffectsKind.NORMAL) {
        return draggingMode.draggingMode === ESpellDraggingModeKind.SELF ? "self-targeting" : null;
    }

    if (draggingMode.light === ESpellDraggingModeKind.SELF && draggingMode.shadow === ESpellDraggingModeKind.SELF) {
        return "self-targeting";
    }

    const maybeSideWithSelfTargetingDraggingMode = (["light", "shadow"] as const).find(
        (side) => draggingMode[side] === ESpellDraggingModeKind.SELF,
    );
    if (!maybeSideWithSelfTargetingDraggingMode) {
        return null;
    }

    return `self-targeting (${maybeSideWithSelfTargetingDraggingMode} form only)`;
}

function formatInnerTableRows(arg: {
    values: ISpellEffectValueWithToLevel[][];
    levelsRow: number[];
    indexColumnPrefix: string;
    indexColumnSuffix: string;
}) {
    return arg.values.flatMap((values, index) => {
        return values.map((value, valueIndex) => [
            valueIndex === 0 ? `${arg.indexColumnPrefix}${index + 1}${arg.indexColumnSuffix}` : "",
            ...arg.levelsRow.map((level, index) => (!value.scalesWithLevel && index > 0 ? "." : value.toLevel(level))),
        ]);
    });
}

function formatSpellValues({
    spell,
    values,
}: {
    spell: ISpell;
    values: ReturnType<typeof spellEffectsValues>;
}): [APIEmbedField, APIEmbedField] | [APIEmbedField] {
    const innerTable = (rangeArg: { start: number; end: number }) => {
        const levelsRow = Array.from(range(rangeArg));
        const rows =
            values.kind === ESpellEffectsKind.NORMAL
                ? formatInnerTableRows({
                      values: values.effects,
                      levelsRow,
                      indexColumnPrefix: "",
                      indexColumnSuffix: ".",
                  })
                : [
                      ...formatInnerTableRows({
                          values: values.light,
                          levelsRow,
                          indexColumnPrefix: "L",
                          indexColumnSuffix: "",
                      }),
                      ...formatInnerTableRows({
                          values: values.shadow,
                          levelsRow,
                          indexColumnPrefix: "S",
                          indexColumnSuffix: "",
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
    const propertiesStr = [
        `${spell.uses ? (spell.uses === 1 ? "Single use" : `${spell.uses} uses`) : "Infinite uses"}`,
        `${spell.cooldown}s cooldown`,
        `targets ${spell.shape.name}`,
        spell.onlyFor ? `only for ${spell.onlyFor.name} units` : undefined,
        formatSpellDraggingMode(spell.draggingMode),
    ]
        .filter(Boolean)
        .join(", ");

    const description = [formatDiscipleSpellUnlock(spell), propertiesStr].filter(Boolean).join("\n");

    const values = spellEffectsValues(spell);
    const valuesFields =
        (values.kind === ESpellEffectsKind.FORM_BASED
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
