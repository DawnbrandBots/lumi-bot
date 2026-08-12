import { describe, expect, test } from "vitest";
import { spellEffectsValues, type ISpellEffectValueWithToLevel } from "../../../src/game/spellEffectValues.ts";
import {
    ESpellEffectKind,
    ESpellEffectScalingStrategyAmountKind,
    ESpellEffectScalingStrategyKind,
    ESpellEffectValueUnitKind,
    ESpellRole,
    type ISpellEffectScalingStrategy,
} from "../../../src/game/types.ts";

const NO_SCALING_STRATEGY = {
    id: "NONE",
    kind: ESpellEffectScalingStrategyKind.NONE,
    amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 0 },
} satisfies ISpellEffectScalingStrategy;

const FIXED_VALUE_SCALING_STRATEGY = {
    id: "ADDITIVE_BASE_PERCENT_10",
    kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
    amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 10 },
} satisfies ISpellEffectScalingStrategy;

const PERCENT_VALUE_SCALING_STRATEGY = {
    id: "ADDITIVE_BASE_PERCENT_5",
    kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
    amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 5 },
} satisfies ISpellEffectScalingStrategy;

const DARK_SLASH_SCALING_STRATEGY = {
    id: "DARK_SLASH",
    kind: ESpellEffectScalingStrategyKind.ADDITIVE_FIXED,
    amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 5 },
} satisfies ISpellEffectScalingStrategy;

const MINION_ATK_SCALING_STRATEGY = {
    id: "MINION_ATK",
    kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
    amount: {
        kind: ESpellEffectScalingStrategyAmountKind.BY_LEVEL_UP,
        values: [20, 40, 60, 80, 100, 120, 140, 160, 170, 180, 200],
    },
} satisfies ISpellEffectScalingStrategy;

function fixedValue(base: number, scalingStrategy: ISpellEffectScalingStrategy = FIXED_VALUE_SCALING_STRATEGY) {
    return {
        base,
        scalingStrategy,
        unit: { kind: ESpellEffectValueUnitKind.FIXED },
    };
}

function percentValue(base: number, scalingStrategy: ISpellEffectScalingStrategy = PERCENT_VALUE_SCALING_STRATEGY) {
    return {
        base,
        scalingStrategy,
        unit: { kind: ESpellEffectValueUnitKind.PERCENT },
    };
}

function serializeValues(values: ISpellEffectValueWithToLevel[][]) {
    return values.map((group) =>
        group.map((value) => ({
            className: value.constructor.name,
            base: value.base,
            scalingStrategy: value.scalingStrategy?.id,
            unit: value.unit,
            levelValues: [1, 2, 12].map((level) => value.toLevel(level)),
        })),
    );
}

describe(spellEffectsValues.name, () => {
    test.each([
        [
            "damage and heal values",
            {
                role: ESpellRole.EX,
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
                role: ESpellRole.EX,
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
                role: ESpellRole.EX,
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
                role: ESpellRole.EX,
                effects: [
                    {
                        kind: ESpellEffectKind.SUMMON,
                        hp: {
                            base: 70,
                            scalingStrategy: FIXED_VALUE_SCALING_STRATEGY,
                        },
                        atk: {
                            base: 45,
                            scalingStrategy: MINION_ATK_SCALING_STRATEGY,
                        },
                    },
                ],
            },
        ],
        [
            "heal value followed by valueless movement",
            {
                role: ESpellRole.EX,
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
                role: ESpellRole.EX,
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
                role: ESpellRole.SHADOW,
                effects: [
                    {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: percentValue(35, DARK_SLASH_SCALING_STRATEGY),
                    },
                ],
            },
        ],
        [
            "non-scaling value",
            {
                role: ESpellRole.EX,
                effects: [
                    {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: fixedValue(50, NO_SCALING_STRATEGY),
                    },
                ],
            },
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof spellEffectsValues>[0]]>)("%s", (_, spell) => {
        expect(serializeValues(spellEffectsValues(spell))).toMatchSnapshot();
    });
});
