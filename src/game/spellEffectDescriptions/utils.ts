import type { DeepPick } from "../../utils/types.ts";
import {
    ESpellEffectKind,
    ESpellEffectTarget,
    type IDamageEffect,
    type IHealEffect,
    type IIceBlockEffect,
    type IMovementEffect,
    type IRepeatEffect,
    type ISpell,
    type ISpellEffect,
    type ISpellEffectValue,
    type ISpellEffectValueFixedUnit,
    type ISpellEffectValuePercentUnit,
    type IStatEffect,
    type IStatusEffect,
    type ISummonEffect,
    type ITileEffect,
    type IWarpEffect,
} from "../types.ts";

export type TSpellEffectValue = DeepPick<ISpellEffectValue, { base: true; effectiveness: true }> & {
    unit:
        | DeepPick<ISpellEffectValueFixedUnit, { kind: true }>
        | DeepPick<ISpellEffectValuePercentUnit, { kind: true; stat: { id: true; name: true } }>;
};

export type TDamageEffect = DeepPick<
    IDamageEffect,
    { kind: true; target: { kind: true; asString: true }; color: { name: true } }
> & { amount: TSpellEffectValue };

export type THealEffect = DeepPick<IHealEffect, { kind: true; target: { kind: true; asString: true } }> & {
    amount: TSpellEffectValue;
};

export type TMovementEffect = DeepPick<
    IMovementEffect,
    { kind: true; target: { kind: true; asString: true }; count: true; direction: { noun: true } }
>;

export type TStatEffect = DeepPick<
    IStatEffect,
    {
        kind: true;
        stat: { id: true; name: true };
        statChange: { verb: true; preposition: true };
        duration: true;
    }
> & { amount: TSpellEffectValue };

export type TRepeatEffect = DeepPick<IRepeatEffect, { kind: true; interval: true; times: true }> & {
    effect: TDamageEffect | THealEffect;
};

export type TStatusEffect = DeepPick<IStatusEffect, { kind: true; target: { kind: true; asString: true } }> & {
    effect: TStatEffect | TRepeatEffect;
};

export type TWarpEffect = DeepPick<IWarpEffect, { kind: true }>;
export type TIceBlockEffect = DeepPick<IIceBlockEffect, { kind: true; hp: { base: true } }>;

export type TTileEffect = DeepPick<ITileEffect, { kind: true; target: { kind: true; asString: true } }> & {
    repeat: TRepeatEffect;
};

export type TSummonEffect = DeepPick<
    ISummonEffect,
    {
        kind: true;
        movementType: { name: true };
        weaponType: { name: true };
        hp: { base: true };
        atk: { base: true };
    }
>;

export type TRootSpellEffect =
    | TDamageEffect
    | THealEffect
    | TMovementEffect
    | TStatusEffect
    | TWarpEffect
    | TIceBlockEffect
    | TTileEffect
    | TSummonEffect;

export type TSpellEffect = TRootSpellEffect | TStatEffect | TRepeatEffect;

export type TSpellEffectDescriptionContext = DeepPick<ISpell, { shape: { name: true; isAoe: true } }>;

export type TSpellEffectDescriptionsInput = TSpellEffectDescriptionContext &
    DeepPick<
        ISpell,
        {
            countdown: true;
            uses: true;
            cooldown: true;
            onlyFor: { name: true };
        }
    > & { effects: TRootSpellEffect[] };

export type TSpellEffectDescriptionFunctions = {
    [K in TSpellEffect["kind"]]: (
        effect: Extract<TSpellEffect, { kind: K }>,
        spell: TSpellEffectDescriptionContext,
        inline: boolean,
    ) => string;
};

export function describeTarget(
    effect: DeepPick<ISpellEffect, { kind: true; target: { kind: true; asString: true } }>,
    spell: TSpellEffectDescriptionContext,
    inline = false,
): string | null {
    if (!effect.target) {
        return null;
    }

    if (effect.target.kind === ESpellEffectTarget.SELF && spell.shape.isAoe) {
        return `targets in ${inline ? spell.shape.name : "shape"} centered around user`;
    }

    if (effect.kind === ESpellEffectKind.TILE) {
        return `target tiles${inline ? ` (${spell.shape.name})` : ""}`;
    }

    if (effect.target.kind === ESpellEffectTarget.ANY && inline) {
        return `${effect.target.asString} (${spell.shape.name})`;
    }

    return effect.target.asString;
}
