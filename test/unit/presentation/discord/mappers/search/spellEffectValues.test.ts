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

function serializeValues(values: ReturnType<typeof spellEffectValues>) {
    return values.map((group) =>
        group.map((value) => ({
            className: value.constructor.name,
            base: value.base,
        })),
    );
}

describe(spellEffectValues.name, () => {
    test.each([
        [
            "damage and heal values",
            [
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: fixedValue(50),
                },
                {
                    kind: ESpellEffectKind.HEAL,
                    amount: fixedValue(30),
                },
            ],
        ],
        [
            "stat value and nested effectiveness values",
            [
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
        ],
        [
            "damage with effectiveness values",
            [
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: {
                        ...fixedValue(25),
                        effectiveness: [{ base: 40 }],
                    },
                },
            ],
        ],
        [
            "summon values",
            [
                {
                    kind: ESpellEffectKind.SUMMON,
                    hp: {
                        base: 70,
                    },
                    atk: {
                        base: 45,
                    },
                },
            ],
        ],
        [
            "heal value followed by valueless movement",
            [
                {
                    kind: ESpellEffectKind.HEAL,
                    amount: fixedValue(35),
                },
                {
                    kind: ESpellEffectKind.MOVEMENT,
                },
            ],
        ],
        [
            "only valueless movement",
            [
                {
                    kind: ESpellEffectKind.MOVEMENT,
                },
            ],
        ],
        [
            "shadow percent damage",
            [
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: percentValue(35, ESpellEffectScalingStrategy.ADDITIVE_FIXED_5),
                },
            ],
        ],
        [
            "non-scaling value",
            [
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: fixedValue(50, ESpellEffectScalingStrategy.NONE),
                },
            ],
        ],
        [
            "different damage values",
            [
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: fixedValue(60),
                },
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: fixedValue(45),
                },
            ],
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof spellEffectValues>[0]]>)("%s", (_, effects) => {
        expect(serializeValues(spellEffectValues(effects))).toMatchSnapshot();
    });
});
