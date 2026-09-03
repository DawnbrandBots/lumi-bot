import type { EStat } from "./stat.types.ts";

export const ESpellEffectValueUnitKind = {
    /** Value is exactly the value described. */
    FIXED: "FIXED",
    /** Value is a percentage of a stat of the spell user. */
    PERCENT: "PERCENT",
} as const;

export const ESpellEffectScalingStrategy = {
    NONE: "NONE",
    ADDITIVE_BASE_PERCENT_5: "ADDITIVE_BASE_PERCENT_5",
    ADDITIVE_BASE_PERCENT_10: "ADDITIVE_BASE_PERCENT_10",
    DARK_SLASH: "DARK_SLASH",
    MINION_ATK: "MINION_ATK",
} as const;

export interface ISpellEffectValueUnit {
    readonly kind: keyof typeof ESpellEffectValueUnitKind;
}

export interface ISpellEffectValueFixedUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.FIXED;
}

export interface ISpellEffectValuePercentUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.PERCENT;
    readonly stat: keyof typeof EStat;
}

export type TSpellEffectValueUnit = ISpellEffectValueFixedUnit | ISpellEffectValuePercentUnit;

/**
 * Specifies a different value for spell effects when targets belong to a certain group.
 *
 * For example: Arrow spells' effect have 40 base damage against Flying units instead of the normal 25.
 */
export interface ISpellEffectValueEffectivenessItem {
    readonly kind: string;
    readonly base: number;
    readonly scalingStrategyOverride?: keyof typeof ESpellEffectScalingStrategy | null;
}

/**
 * Spell effects have values which may vary with level and targeted units.
 *
 * Eg. X damage, X HP restored, stat drops by X percent...
 */
export interface ISpellEffectValue {
    /** Value of spell effect for the spell's level 1. */
    readonly base: number;
    readonly scalingStrategyOverride?: keyof typeof ESpellEffectScalingStrategy | null;
    readonly unit: ISpellEffectValueUnit;
    readonly effectiveness?: ISpellEffectValueEffectivenessItem[] | null;
}
