import type {
    IWeaponSkillEffect,
    IWeaponSkillFoeCondition,
    IWeaponSkillHpCondition,
    IWeaponSkillOnAutoAttackKillEffect,
    IWeaponSkillStatEffect,
    IWeaponSkillWeaponDamageEffect,
} from "../../../../domain/game/models/weaponSkillEffect.types.ts";
import {
    EWeaponSkillCondition,
    type EWeaponSkillEffectChange,
    EWeaponSkillEffectKind,
    type EWeaponSkillHpOperand,
    type EWeaponSkillWeaponDamageAction,
} from "../../../../domain/game/models/weaponSkillEffect.types.ts";
import {
    describeUnitSelector,
    type TUnitSelectorDescriptionInput,
} from "./spellEffectDescriptions/unitSelectorDescriptions.ts";
import { STAT_DESCRIPTION_STRINGS } from "./statDescriptions.ts";

type TWeaponSkillFoeConditionInput = Pick<IWeaponSkillFoeCondition, "kind"> & {
    readonly foeSelector: TUnitSelectorDescriptionInput;
};

type TWeaponSkillWeaponDamageEffectInput = Omit<IWeaponSkillWeaponDamageEffect, "condition"> & {
    readonly condition?: TWeaponSkillFoeConditionInput | IWeaponSkillHpCondition | null;
};

export type TWeaponSkillEffectDescriptionInput = {
    readonly effects: ReadonlyArray<
        IWeaponSkillOnAutoAttackKillEffect | IWeaponSkillStatEffect | TWeaponSkillWeaponDamageEffectInput
    >;
};

function lowercaseFirstLetter(description: string): string {
    return description.charAt(0).toLowerCase() + description.slice(1);
}

const DAMAGE_TYPE_STRINGS = {
    RECEIVED_WEAPON_DAMAGE: "weapon",
    RECEIVED_SPELL_DAMAGE: "spell",
} as const satisfies Record<"RECEIVED_WEAPON_DAMAGE" | "RECEIVED_SPELL_DAMAGE", string>;

const DAMAGE_CHANGE_STRINGS = {
    INCREASE: "more",
    DECREASE: "less",
} as const satisfies Record<keyof typeof EWeaponSkillEffectChange, string>;

const STAT_CHANGE_VERBS = {
    INCREASE: "Boost",
    DECREASE: "Reduce",
} as const satisfies Record<keyof typeof EWeaponSkillEffectChange, string>;

const COOLDOWN_CHANGE_VERBS = {
    INCREASE: "Increase",
    DECREASE: "Reduce",
} as const satisfies Record<keyof typeof EWeaponSkillEffectChange, string>;

const WEAPON_DAMAGE_ACTION_STRINGS = {
    DEAL_TO: { verb: "Deal", foePreposition: "against" },
    TAKE_FROM: { verb: "Take", foePreposition: "from" },
} as const satisfies Record<keyof typeof EWeaponSkillWeaponDamageAction, { verb: string; foePreposition: string }>;

const HP_THRESHOLD_STRINGS = {
    GREATER_OR_EQUAL: "at least",
    LOWER_OR_EQUAL: "at most",
} as const satisfies Record<keyof typeof EWeaponSkillHpOperand, string>;

function describeStatEffect(effect: IWeaponSkillStatEffect): string {
    if (effect.stat === "RECEIVED_WEAPON_DAMAGE" || effect.stat === "RECEIVED_SPELL_DAMAGE") {
        return `Take ${effect.amount}% ${DAMAGE_CHANGE_STRINGS[effect.change]} ${DAMAGE_TYPE_STRINGS[effect.stat]} damage`;
    }

    if (effect.stat === "COOLDOWN") {
        return `${COOLDOWN_CHANGE_VERBS[effect.change]} spell cooldown by ${effect.amount}%`;
    }

    return `${STAT_CHANGE_VERBS[effect.change]} ${STAT_DESCRIPTION_STRINGS[effect.stat]} by ${effect.amount}%`;
}

function describeWeaponDamageEffect(effect: TWeaponSkillWeaponDamageEffectInput): string {
    const action = WEAPON_DAMAGE_ACTION_STRINGS[effect.action];
    let condition = "";

    if (effect.condition?.kind === EWeaponSkillCondition.FOE) {
        condition = ` ${action.foePreposition} ${describeUnitSelector(effect.condition.foeSelector)}`;
    } else if (effect.condition?.kind === EWeaponSkillCondition.HP) {
        condition = ` while HP is ${HP_THRESHOLD_STRINGS[effect.condition.operand]} ${effect.condition.percentage}%`;
    }

    return `${action.verb} ${effect.amount}% ${DAMAGE_CHANGE_STRINGS[effect.change]} weapon damage${condition}`;
}

function describeOnAutoAttackKillEffect(effect: IWeaponSkillOnAutoAttackKillEffect): string {
    const status = lowercaseFirstLetter(describeStatEffect(effect.effect));
    const duration = `${effect.effect.duration} turn${effect.effect.duration === 1 ? "" : "s"}`;
    return `After defeating a foe with a weapon attack, grant "${status} (${duration})" to user`;
}

function describeEffect(effect: TWeaponSkillEffectDescriptionInput["effects"][number]): string {
    switch (effect.kind) {
        case EWeaponSkillEffectKind.ON_AUTO_ATTACK_KILL:
            return describeOnAutoAttackKillEffect(effect);
        case EWeaponSkillEffectKind.STAT_CHANGE:
            return describeStatEffect(effect);
        case EWeaponSkillEffectKind.WEAPON_DAMAGE_CHANGE:
            return describeWeaponDamageEffect(effect);
    }
}

/** Describes every part of a weapon skill effect in a single sentence. */
export function describeWeaponSkillEffects(
    weaponSkillEffect: IWeaponSkillEffect | TWeaponSkillEffectDescriptionInput,
): string {
    const descriptions = weaponSkillEffect.effects.map(describeEffect);
    const last = descriptions.at(-1);
    if (!last) {
        return "";
    }
    if (descriptions.length === 1) {
        return `${last}.`;
    }

    return `${descriptions.slice(0, -1).join(", ")} and ${lowercaseFirstLetter(last)}.`;
}
