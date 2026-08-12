import type { PickDeep } from "type-fest";
import { SPELL_MAXIMUM_LEVEL } from "./constants.ts";
import type {
    ISpell,
    ISpellEffectScalingStrategy,
    ISpellEffectValue,
    ISpellEffectValueEffectivenessItem,
    ISummonEffectStatValue,
    TSpellEffectKindToEffectMap,
} from "./types.ts";
import { ESpellEffectScalingStrategyAmountKind, ESpellEffectScalingStrategyKind } from "./types.ts";

type TEffectWithAmountInput = {
    // Can't just straight up use PickDeep over IDamageEffect and IHealEffect because
    // `amount.effectiveness.${number}.base` removes `null` from `effectiveness`.
    // Not necessarily a bug: https://github.com/sindresorhus/type-fest/issues/880
    readonly amount: PickDeep<ISpellEffectValue, "base" | "unit.kind" | "scalingStrategy"> & {
        readonly effectiveness?: ReadonlyArray<
            PickDeep<ISpellEffectValueEffectivenessItem, "base" | "scalingStrategy">
        > | null;
    };
};

type TSpellEffectValueGetterInputMapWithoutKind = {
    DAMAGE: TEffectWithAmountInput;
    HEAL: TEffectWithAmountInput;
    MOVEMENT: object;
    STAT: TEffectWithAmountInput;
    REPEAT: { readonly effect: TSpellEffectValueGetterInputMap["DAMAGE" | "HEAL"] };
    STATUS: { readonly effect: TSpellEffectValueGetterInputMap["STAT" | "REPEAT"] };
    WARP: object;
    OBSTACLE: PickDeep<TSpellEffectKindToEffectMap["OBSTACLE"], "hp.base" | "hp.scalingStrategy">;
    TILE: { readonly repeat: TSpellEffectValueGetterInputMap["REPEAT"] };
    SUMMON: PickDeep<
        TSpellEffectKindToEffectMap["SUMMON"],
        "hp.base" | "hp.scalingStrategy" | "atk.base" | "atk.scalingStrategy"
    >;
};

type TSpellEffectValueGetterInputMap = {
    [K in keyof TSpellEffectValueGetterInputMapWithoutKind]: TSpellEffectValueGetterInputMapWithoutKind[K] &
        Pick<TSpellEffectKindToEffectMap[K], "kind">;
};
type TSpellEffectValueGetterInput = TSpellEffectValueGetterInputMap[keyof TSpellEffectValueGetterInputMap];

// TODO: admittedly, this name sucks. I think I should include something like "DBModel" in db-related models name so I could use "ISpellEffectValue" here for example.
// Maybe in another PR that refactors data access for this repository.
// TODO: maybe this weird `Omit<ISpellEffectValue, "effectiveness"> &` construct is a sign I should rethink of effectiveness is represented in ISpellEffectValue.
export type ISpellEffectValueWithToLevel = Omit<ISpellEffectValue, "effectiveness"> & {
    readonly hasLevelProgression: boolean;
    /** Returns the effect's base value for the given level. */
    toLevel(level: number): number;
};

export abstract class Value implements ISpellEffectValueWithToLevel {
    public readonly base: ISpellEffectValueWithToLevel["base"];
    public readonly scalingStrategy: ISpellEffectValueWithToLevel["scalingStrategy"];
    public abstract readonly unit: ISpellEffectValueWithToLevel["unit"];
    public get hasLevelProgression(): boolean {
        return this.scalingStrategy?.kind !== ESpellEffectScalingStrategyKind.NONE;
    }
    public abstract toLevel(level: number): number;

    public constructor(arg: Pick<ISpellEffectValue, "base" | "scalingStrategy">) {
        this.base = arg.base;
        this.scalingStrategy = arg.scalingStrategy;
    }
}

type TScalingValueInput = Pick<ISpellEffectValue, "base" | "scalingStrategy" | "unit">;

export class ScalingValue extends Value implements ISpellEffectValueWithToLevel {
    public readonly unit: ISpellEffectValueWithToLevel["unit"];

    public constructor(arg: TScalingValueInput) {
        super(arg);
        this.unit = arg.unit;
    }

    public toLevel(level: number) {
        const scalingStrategy = this.scalingStrategy;
        if (!scalingStrategy) {
            throw new Error("Spell effect value is missing a scaling strategy.");
        }

        switch (scalingStrategy.kind) {
            case ESpellEffectScalingStrategyKind.NONE:
                return this.base;
            case ESpellEffectScalingStrategyKind.ADDITIVE_BASE_PERCENT: {
                const amount = scalingAmount(scalingStrategy, level);
                return Math.floor(this.base + (this.base * amount) / 100);
            }
            case ESpellEffectScalingStrategyKind.ADDITIVE_FIXED: {
                const amount = scalingAmount(scalingStrategy, level);
                return Math.floor(this.base + amount);
            }
        }
    }
}

function scalingAmount(strategy: ISpellEffectScalingStrategy, level: number): number {
    if (level === 1) {
        return 0;
    }

    switch (strategy.amount.kind) {
        case ESpellEffectScalingStrategyAmountKind.BY_LEVEL_UP:
            return strategy.amount.values[level - 2] ?? 0;
        case ESpellEffectScalingStrategyAmountKind.CONSTANT:
            return strategy.amount.value * (level === SPELL_MAXIMUM_LEVEL ? level : level - 1);
    }
}

const noValues = () => [];
const withEffectiveness = (effect: TEffectWithAmountInput) => {
    return [new ScalingValue(effect.amount)].concat(
        effect.amount.effectiveness?.map(
            (eff) =>
                new ScalingValue({
                    base: eff.base,
                    scalingStrategy: eff.scalingStrategy ?? effect.amount.scalingStrategy,
                    unit: effect.amount.unit,
                }),
        ) ?? [],
    );
};

function statValue(stat: Pick<ISummonEffectStatValue, "base" | "scalingStrategy">): ScalingValue {
    return new ScalingValue({
        base: stat.base,
        scalingStrategy: stat.scalingStrategy,
        unit: { kind: "FIXED" },
    });
}

const SPELL_EFFECT_VALUE_GETTERS: {
    [K in TSpellEffectValueGetterInput["kind"]]: (
        effect: Extract<TSpellEffectValueGetterInput, { kind: K }>,
    ) => ISpellEffectValueWithToLevel[];
} = {
    DAMAGE: withEffectiveness,
    HEAL: withEffectiveness,
    MOVEMENT: noValues,
    STAT: withEffectiveness,
    STATUS(effect) {
        return valuesForEffect(effect.effect);
    },
    REPEAT(effect) {
        return valuesForEffect(effect.effect);
    },
    WARP: noValues,
    OBSTACLE(effect) {
        return [statValue(effect.hp)];
    },
    TILE(effect) {
        return valuesForEffect(effect.repeat);
    },
    SUMMON(effect) {
        return [statValue(effect.hp), statValue(effect.atk)];
    },
};

function valuesForEffect<K extends TSpellEffectValueGetterInput["kind"]>(
    effect: Extract<TSpellEffectValueGetterInput, { kind: K }>,
): ISpellEffectValueWithToLevel[] {
    return SPELL_EFFECT_VALUE_GETTERS[effect.kind](effect);
}

/**
 * Returns an array of arrays of ${@link ISpellEffectValueWithToLevel} for each spell effect. Subarrays have 0 or more entries depending on how many numeric values the effect has.
 *
 * Some examples with actual spells from the game:
 *
 * - "Aether EX" as argument returns an array with two subarrays, each with one entry: the first subarray's entry represents damage while the second subarray's entry represents healing.
 * - "Crossedge Boost EX" as argument returns an array with two subarrays:
 *   1. Subarray with one entry for the Atk stat boost.
 *   2. Subarray with two entries: one for the movement boost applied to Infantry units, the other for non-Infantry units (0).
 * - "Distant Thunder" as argument returns an array with one subarray with two entries: one for the regular damage and the other for damage dealt to ranged units.
 * - Any minion spell as argument returns an array with one subarray with two entries: one for the minion's HP and the other for Atk.
 * - "Heal Pull" as argument returns an array with one subarray with one entry for the Heal effect and another subarray with no entry for the Movement effect.
 * - "Minor Pull" as argument returns an array with one empty subarray since it only has one effect with no numeric value.
 */
export function spellEffectsValues(
    spell: Pick<ISpell, "role"> & {
        readonly effects: TSpellEffectValueGetterInput[];
    },
): ISpellEffectValueWithToLevel[][] {
    return spell.effects.map(valuesForEffect);
}
