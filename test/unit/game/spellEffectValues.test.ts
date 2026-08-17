import { describe, expect, test } from "vitest";
import { ESpellRole } from "../../../src/domain/game/models/spell.types.ts";
import { ESpellEffectKind } from "../../../src/domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../src/domain/game/models/spellEffectValue.types.ts";
import {
    spellEffectsValues,
    type ISpellEffectValueWithToLevel,
} from "../../../src/presentation/discord/mappers/search/spellEffectValues.ts";

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

function serializeValues(values: ISpellEffectValueWithToLevel[][]) {
    return values.map((group) =>
        group.map((value) => ({
            className: value.constructor.name,
            base: value.base,
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
                        },
                        atk: {
                            base: 45,
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
                        amount: percentValue(35, ESpellEffectScalingStrategy.DARK_SLASH),
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
                        amount: fixedValue(50, ESpellEffectScalingStrategy.NONE),
                    },
                ],
            },
        ],
    ] satisfies ReadonlyArray<readonly [string, Parameters<typeof spellEffectsValues>[0]]>)("%s", (_, spell) => {
        expect(serializeValues(spellEffectsValues(spell))).toMatchSnapshot();
    });
});
