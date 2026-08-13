import {
    ESpellEffectScalingStrategy,
    ESpellEffectScalingStrategyAmountKind,
    ESpellEffectScalingStrategyKind,
    type ISpellEffectScalingStrategy,
} from "./types.ts";

export const SPELL_EFFECT_SCALING_STRATEGIES = {
    [ESpellEffectScalingStrategy.NONE]: {
        id: ESpellEffectScalingStrategy.NONE,
        kind: ESpellEffectScalingStrategyKind.NONE,
        amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 0 },
    },
    [ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_5]: {
        id: ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_5,
        kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
        amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 5 },
    },
    [ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_10]: {
        id: ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_10,
        kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
        amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 10 },
    },
    [ESpellEffectScalingStrategy.DARK_SLASH]: {
        id: ESpellEffectScalingStrategy.DARK_SLASH,
        kind: ESpellEffectScalingStrategyKind.ADDITIVE_FIXED,
        amount: { kind: ESpellEffectScalingStrategyAmountKind.CONSTANT, value: 5 },
    },
    [ESpellEffectScalingStrategy.MINION_ATK]: {
        id: ESpellEffectScalingStrategy.MINION_ATK,
        kind: ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT,
        amount: {
            kind: ESpellEffectScalingStrategyAmountKind.BY_LEVEL_UP,
            values: [20, 40, 60, 80, 100, 120, 140, 160, 170, 180, 200],
        },
    },
} satisfies Record<keyof typeof ESpellEffectScalingStrategy, ISpellEffectScalingStrategy>;
