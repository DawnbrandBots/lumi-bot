import type { ReadonlyDeep } from "type-fest";
import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../src/domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../../../../src/domain/game/models/spellEffectValue.types.ts";
import spellEffectValues from "../../../../../../src/presentation/discord/mappers/search/spellEffectValues.ts";

describe(spellEffectValues.name, () => {
    test.each([
        {
            name: "damage",
            input: {
                kind: ESpellEffectKind.DAMAGE,
                amount: { base: 50, unit: { kind: ESpellEffectValueUnitKind.FIXED } },
            },
            expected: [[50, 55, true]],
        },
        {
            name: "healing",
            input: {
                kind: ESpellEffectKind.HEAL,
                amount: { base: 30, unit: { kind: ESpellEffectValueUnitKind.FIXED } },
            },
            expected: [[30, 33, true]],
        },
        {
            name: "percentage stat boost",
            input: {
                kind: ESpellEffectKind.STAT,
                amount: { base: 20, unit: { kind: ESpellEffectValueUnitKind.PERCENT } },
            },
            expected: [[20, 21, true]],
        },
        {
            name: "status with a nested stat boost and effectiveness value",
            input: {
                kind: ESpellEffectKind.STATUS,
                effect: {
                    kind: ESpellEffectKind.STAT,
                    amount: {
                        base: 30,
                        unit: { kind: ESpellEffectValueUnitKind.PERCENT },
                        effectiveness: [{ base: 0 }],
                    },
                },
            },
            expected: [
                [30, 31, true],
                [0, 0, true],
            ],
        },
        {
            name: "damage with an effectiveness value",
            input: {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 25,
                    unit: { kind: ESpellEffectValueUnitKind.FIXED },
                    effectiveness: [{ base: 40 }],
                },
            },
            expected: [
                [25, 27, true],
                [40, 44, true],
            ],
        },
        {
            name: "summon HP and Atk",
            input: {
                kind: ESpellEffectKind.SUMMON,
                hp: { base: 70 },
                atk: { base: 45 },
            },
            expected: [
                [70, 77, true],
                [45, 54, true],
            ],
        },
        {
            name: "movement without values",
            input: { kind: ESpellEffectKind.MOVEMENT },
            expected: [],
        },
        {
            name: "percentage damage with fixed scaling",
            input: {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 35,
                    unit: { kind: ESpellEffectValueUnitKind.PERCENT },
                    scalingStrategyOverride: ESpellEffectScalingStrategy.ADDITIVE_FIXED_5,
                },
            },
            expected: [[35, 40, true]],
        },
        {
            name: "non-scaling damage",
            input: {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 50,
                    unit: { kind: ESpellEffectValueUnitKind.FIXED },
                    scalingStrategyOverride: ESpellEffectScalingStrategy.NONE,
                },
            },
            expected: [[50, 50, false]],
        },
    ] satisfies ReadonlyDeep<
        {
            name: string;
            input: Parameters<typeof spellEffectValues>[0];
            expected: [base: number, levelTwo: number, scalesWithLevel: boolean][];
        }[]
    >)("$name", (testCase) => {
        expect(
            spellEffectValues(testCase.input).map((value) => [value.base, value.toLevel(2), value.scalesWithLevel]),
        ).toEqual(testCase.expected);
    });
});
