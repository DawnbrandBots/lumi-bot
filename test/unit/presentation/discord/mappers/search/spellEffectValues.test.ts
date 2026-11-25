import { describe, expect, test } from "vitest";
import { ESpellEffectKind } from "../../../../../../src/domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../../../../src/domain/game/models/spellEffectValue.types.ts";
import spellEffectValues from "../../../../../../src/presentation/discord/mappers/search/spellEffectValues.ts";

function fixedValue(base: number, scalingStrategyOverride?: keyof typeof ESpellEffectScalingStrategy) {
    return {
        base,
        scalingStrategyOverride,
        unit: { kind: ESpellEffectValueUnitKind.FIXED },
    };
}

function percentValue(base: number, scalingStrategyOverride?: keyof typeof ESpellEffectScalingStrategy) {
    return {
        base,
        scalingStrategyOverride,
        unit: { kind: ESpellEffectValueUnitKind.PERCENT },
    };
}

describe(spellEffectValues.name, () => {
    test.each([
        ["damage", { kind: ESpellEffectKind.DAMAGE, amount: fixedValue(50) }, [[50, 55, true]]],
        ["healing", { kind: ESpellEffectKind.HEAL, amount: fixedValue(30) }, [[30, 33, true]]],
        ["percentage stat boost", { kind: ESpellEffectKind.STAT, amount: percentValue(20) }, [[20, 21, true]]],
        [
            "status with a nested stat boost and effectiveness value",
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
                    ...fixedValue(25),
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
                amount: percentValue(35, ESpellEffectScalingStrategy.ADDITIVE_FIXED_5),
            },
            [[35, 40, true]],
        ],
        [
            "non-scaling damage",
            {
                kind: ESpellEffectKind.DAMAGE,
                amount: fixedValue(50, ESpellEffectScalingStrategy.NONE),
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
