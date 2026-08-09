import type { IStat } from "./stat.types.ts";

export const ESpellEffectValueUnitKind = {
    /**
     * Value is exactly the value described.
     */
    FIXED: "FIXED",
    /**
     * Value is a percentage of a stat of the spell user.
     */
    PERCENT: "PERCENT",
} as const;

export interface ISpellEffectValueUnit {
    readonly kind: keyof typeof ESpellEffectValueUnitKind;
}

export interface ISpellEffectValueFixedUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.FIXED;
}

export interface ISpellEffectValuePercentUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.PERCENT;
    readonly stat: IStat;
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
}

/**
 * Spell effects have values which may vary with level and targeted units.
 *
 * Eg. X damage, X HP restored, stat drops by X percent...
 */
export interface ISpellEffectValue {
    /**
     * Value of spell effect for the spell's level 1.
     */
    readonly base: number;
    readonly scalesWithLevel: boolean;
    readonly unit: ISpellEffectValueUnit;
    readonly effectiveness?: ISpellEffectValueEffectivenessItem[] | null;
}
