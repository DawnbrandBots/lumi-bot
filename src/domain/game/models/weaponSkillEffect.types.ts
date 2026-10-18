import type { TId } from "./base.types.ts";
import type { EStat } from "./stat.types.ts";
import type { TUnitSelector } from "./unitSelector.types.ts";

export const EWeaponSkillEffectKind = {
    STATUS_EFFECT_ON_AUTO_ATTACK_KILL: "STATUS_EFFECT_ON_AUTO_ATTACK_KILL",
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

export interface IWeaponSkillStatChange {
    readonly change: keyof typeof EWeaponSkillEffectChange;
    readonly amount: number;
}

export interface IWeaponSkillStatEffect {
    readonly kind: typeof EWeaponSkillEffectKind.STAT_CHANGE;
    readonly MAX_HP?: IWeaponSkillStatChange | null;
    readonly ATK?: IWeaponSkillStatChange | null;
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

/** A status effect granted after the wielder defeats a foe with a weapon attack. */
export interface IWeaponSkillStatusEffectOnAutoAttackKill extends IWeaponSkillStatChange {
    readonly kind: typeof EWeaponSkillEffectKind.STATUS_EFFECT_ON_AUTO_ATTACK_KILL;
    readonly stat: keyof typeof EStat;
    readonly duration: number;
}

export type TWeaponSkillEffectPart =
    IWeaponSkillStatusEffectOnAutoAttackKill | IWeaponSkillStatEffect | IWeaponSkillWeaponDamageEffect;

/**
 * Effect that a weapon skill grants.
 *
 * Multiple weapon skills may grant the same effect.
 */
export interface IWeaponSkillEffect {
    readonly kind: "weaponSkillEffect";
    readonly id: TId;
    readonly effect: TWeaponSkillEffectPart;
}
