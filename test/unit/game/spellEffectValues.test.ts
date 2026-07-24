import { describe, expect, test } from "vitest";
import { spellEffectsValues, type ISpellEffectValueWithToLevel } from "../../../src/game/spellEffectValues.ts";
import { ESpellEffectKind, ESpellEffectValueUnitKind, ESpellRole } from "../../../src/game/types.ts";

function fixedValue(base: number, scalesWithLevel = true) {
    return {
        base,
        scalesWithLevel,
        unit: { kind: ESpellEffectValueUnitKind.FIXED },
    };
}

function percentValue(base: number, scalesWithLevel = true) {
    return {
        base,
        scalesWithLevel,
        unit: { kind: ESpellEffectValueUnitKind.PERCENT },
    };
}

function serializeValues(values: ISpellEffectValueWithToLevel[][]) {
    return values.map((group) =>
        group.map((value) => ({
            className: value.constructor.name,
            base: value.base,
            scalesWithLevel: value.scalesWithLevel,
            unit: value.unit,
        })),
    );
}

describe(spellEffectsValues.name, () => {
    test.each([
        [
            "damage and heal values",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: fixedValue(50),
                    },
                    {
                        kind: ESpellEffectKind.HEAL,
                        amount: fixedValue(30),
                    },
                ],
            },
        ],
        [
            "stat value and nested effectiveness values",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.STAT,
                        amount: percentValue(20),
                    },
                    {
                        kind: ESpellEffectKind.STATUS,
                        effect: {
                            kind: ESpellEffectKind.STAT,
                            amount: {
                                ...percentValue(30),
                                effectiveness: [{ base: 0 }],
                            },
                        },
                    },
                ],
            },
        ],
        [
            "damage with effectiveness values",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: {
                            ...fixedValue(25),
                            effectiveness: [{ base: 40 }],
                        },
                    },
                ],
            },
        ],
        [
            "summon values",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.SUMMON,
                        hp: { base: 70, scalesWithLevel: true },
                        atk: { base: 45, scalesWithLevel: true },
                    },
                ],
            },
        ],
        [
            "heal value followed by valueless movement",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.HEAL,
                        amount: fixedValue(35),
                    },
                    {
                        kind: ESpellEffectKind.MOVEMENT,
                    },
                ],
            },
        ],
        [
            "only valueless movement",
            {
                role: { kind: ESpellRole.EX },
                effects: [
                    {
                        kind: ESpellEffectKind.MOVEMENT,
                    },
                ],
            },
        ],
        [
            "shadow percent damage",
            {
                role: { kind: ESpellRole.SHADOW },
                effects: [
                    {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: percentValue(35),
                    },
                ],
            },
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof spellEffectsValues>[0]]>)("%s", (_, spell) => {
        expect(serializeValues(spellEffectsValues(spell))).toMatchSnapshot();
    });
});
