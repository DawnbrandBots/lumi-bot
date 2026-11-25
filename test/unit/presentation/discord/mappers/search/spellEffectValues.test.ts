import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../src/domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../../../../src/domain/game/models/spellEffectValue.types.ts";
import spellEffectValues from "../../../../../../src/presentation/discord/mappers/search/spellEffectValues.ts";

describe(spellEffectValues.name, () => {
    test.each([
        [
            "damage",
            { kind: ESpellEffectKind.DAMAGE, amount: { base: 50, unit: { kind: ESpellEffectValueUnitKind.FIXED } } },
            [[50, 55, true]],
        ],
        [
            "healing",
            { kind: ESpellEffectKind.HEAL, amount: { base: 30, unit: { kind: ESpellEffectValueUnitKind.FIXED } } },
            [[30, 33, true]],
        ],
        [
            "percentage stat boost",
            { kind: ESpellEffectKind.STAT, amount: { base: 20, unit: { kind: ESpellEffectValueUnitKind.PERCENT } } },
            [[20, 21, true]],
        ],
        [
            "status with a nested stat boost and effectiveness value",
            {
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
            [
                [30, 31, true],
                [0, 0, true],
            ],
        ],
        [
            "damage with an effectiveness value",
            {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 25,
                    unit: { kind: ESpellEffectValueUnitKind.FIXED },
                    effectiveness: [{ base: 40 }],
                },
            },
            [
                [25, 27, true],
                [40, 44, true],
            ],
        ],
        [
            "summon HP and Atk",
            {
                kind: ESpellEffectKind.SUMMON,
                hp: { base: 70 },
                atk: { base: 45 },
            },
            [
                [70, 77, true],
                [45, 54, true],
            ],
        ],
        ["movement without values", { kind: ESpellEffectKind.MOVEMENT }, []],
        [
            "percentage damage with fixed scaling",
            {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 35,
                    unit: { kind: ESpellEffectValueUnitKind.PERCENT },
                    scalingStrategyOverride: ESpellEffectScalingStrategy.ADDITIVE_FIXED_5,
                },
            },
            [[35, 40, true]],
        ],
        [
            "non-scaling damage",
            {
                kind: ESpellEffectKind.DAMAGE,
                amount: {
                    base: 50,
                    unit: { kind: ESpellEffectValueUnitKind.FIXED },
                    scalingStrategyOverride: ESpellEffectScalingStrategy.NONE,
                },
            },
            [[50, 50, false]],
        ],
    ] satisfies ReadonlyArray<
        readonly [
            string,
            Parameters<typeof spellEffectValues>[0],
            readonly (readonly [base: number, levelTwo: number, scalesWithLevel: boolean])[],
        ]
    >)("%s", (_, effect, expected) => {
        expect(spellEffectValues(effect).map((value) => [value.base, value.toLevel(2), value.scalesWithLevel])).toEqual(
            expected,
        );
    });
});
