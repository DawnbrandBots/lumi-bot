import type { TId } from "./base.types.ts";
import type { EStat } from "./stat.types.ts";
import type { TUnitSelector } from "./unitSelector.types.ts";

export const EWeaponSkillEffectKind = {
    ON_AUTO_ATTACK_KILL: "ON_AUTO_ATTACK_KILL",
    STAT_CHANGE: "STAT_CHANGE",
    WEAPON_DAMAGE_CHANGE: "WEAPON_DAMAGE_CHANGE",
} as const;

export const EWeaponSkillEffectChange = {
    INCREASE: "INCREASE",
    DECREASE: "DECREASE",
} as const;

export const EWeaponSkillWeaponDamageAction = {
    DEAL_TO: "DEAL_TO",
    TAKE_FROM: "TAKE_FROM",
} as const;

export const EWeaponSkillHpOperand = {
    GREATER_OR_EQUAL: "GREATER_OR_EQUAL",
    LOWER_OR_EQUAL: "LOWER_OR_EQUAL",
} as const;

export const EWeaponSkillCondition = {
    FOE: "FOE",
    HP: "HP",
} as const;

export interface IWeaponSkillStatEffect {
    readonly kind: typeof EWeaponSkillEffectKind.STAT_CHANGE;
    readonly stat: keyof typeof EStat;
    readonly change: keyof typeof EWeaponSkillEffectChange;
    readonly amount: number;
}

export interface IWeaponSkillTimedStatEffect extends IWeaponSkillStatEffect {
    readonly duration: number;
}

export interface IWeaponSkillHpCondition {
    readonly kind: typeof EWeaponSkillCondition.HP;
    readonly operand: keyof typeof EWeaponSkillHpOperand;
    readonly percentage: number;
}

export interface IWeaponSkillFoeCondition {
    readonly kind: typeof EWeaponSkillCondition.FOE;
    readonly foeSelector: TUnitSelector;
}

export interface IWeaponSkillWeaponDamageEffect {
    readonly kind: typeof EWeaponSkillEffectKind.WEAPON_DAMAGE_CHANGE;
    readonly action: keyof typeof EWeaponSkillWeaponDamageAction;
    readonly change: keyof typeof EWeaponSkillEffectChange;
    readonly amount: number;
    // Remark: later on, IWeaponSkillHpCondition could turn into a "IWeaponSkillUnitCondition"
    // that has a unit selector checking the unit's HP.
    readonly condition?: IWeaponSkillHpCondition | IWeaponSkillFoeCondition | null;
}

/** An effect that occurs after the wielder triggers an event. */
export interface IWeaponSkillOnAutoAttackKillEffect {
    readonly kind: typeof EWeaponSkillEffectKind.ON_AUTO_ATTACK_KILL;
    readonly effect: IWeaponSkillTimedStatEffect;
}

export type TWeaponSkillEffectPart =
    IWeaponSkillOnAutoAttackKillEffect | IWeaponSkillStatEffect | IWeaponSkillWeaponDamageEffect;

/**
 * Effect that a weapon skill grants.
 *
 * Multiple weapon skills may grant the same effect.
 */
export interface IWeaponSkillEffect {
    readonly kind: "weaponSkillEffect";
    readonly id: TId;
    // To be replaced by structured effects when weapon skill data and descriptions are migrated.
    readonly description: string;
}
