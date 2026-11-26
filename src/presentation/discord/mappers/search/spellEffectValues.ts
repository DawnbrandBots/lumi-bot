import type { PickDeep } from "type-fest";
import { SPELL_MAXIMUM_LEVEL } from "../../../../domain/game/constants.ts";
import type { TSpellEffectKindToEffectMap } from "../../../../domain/game/models/spellEffect.types.ts";
import type {
    ISpellEffectValue,
    ISpellEffectValueEffectivenessItem,
} from "../../../../domain/game/models/spellEffectValue.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../../domain/game/models/spellEffectValue.types.ts";
import functify from "../../../../utils/functify.ts";

type TEffectWithAmountInput = {
    // Can't just straight up use PickDeep over IDamageEffect and IHealEffect because
    // `amount.effectiveness.${number}.base` removes `null` from `effectiveness`.
    // Not necessarily a bug: https://github.com/sindresorhus/type-fest/issues/880
    readonly amount: PickDeep<ISpellEffectValue, "base" | "unit.kind" | "scalingStrategyOverride"> & {
        readonly effectiveness?: ReadonlyArray<
            PickDeep<ISpellEffectValueEffectivenessItem, "base" | "scalingStrategyOverride">
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
    OBSTACLE: PickDeep<TSpellEffectKindToEffectMap["OBSTACLE"], "hp.base">;
    TILE: { readonly repeat: TSpellEffectValueGetterInputMap["REPEAT"] };
    SUMMON: PickDeep<
        TSpellEffectKindToEffectMap["SUMMON"],
        "hp.base" | "atk.base" | "hp.scalingStrategyOverride" | "atk.scalingStrategyOverride"
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
export type ISpellEffectValueWithToLevel = Omit<ISpellEffectValue, "effectiveness" | "unit"> & {
    /** Returns the effect's base value for the given level. */
    toLevel(level: number): number;
    scalesWithLevel: boolean;
};

/** This exists because minions' Atk stats increases differently for some levels, whereas all other kind of spell effect values grow by 5 or 10% per level. */
export type ISpellEffectValueWithToLevelAndConsistentScale = ISpellEffectValueWithToLevel & {
    /** Amount by which an effect's base value increases per level. */
    scale: number;
};

export abstract class Value implements ISpellEffectValueWithToLevel {
    public readonly base: ISpellEffectValueWithToLevel["base"];
    public abstract readonly scalesWithLevel: ISpellEffectValueWithToLevel["scalesWithLevel"];
    public abstract toLevel(level: number): number;

    public constructor(arg: Pick<ISpellEffectValue, "base">) {
        this.base = arg.base;
    }
}

export class NonScalingValue extends Value implements ISpellEffectValueWithToLevel {
    public toLevel() {
        return this.base;
    }

    public get scalesWithLevel() {
        return false;
    }
}

export abstract class ValueWithScale extends Value implements ISpellEffectValueWithToLevelAndConsistentScale {
    public abstract readonly scale: ISpellEffectValueWithToLevelAndConsistentScale["scale"];

    public toLevel(level: number) {
        return Math.floor(this.base + this.scale * (level === SPELL_MAXIMUM_LEVEL ? level : level - 1));
    }

    public get scalesWithLevel() {
        return true;
    }
}

/** Represents how normal spell effect values grow: 10% per level for fixed values and 5% for percent values. */
export class Percent5ScaleValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public get scale() {
        return this.base / 20;
    }
}

/** Represents how normal spell effect values grow: 10% per level for fixed values and 5% for percent values. */
export class Percent10ScaleValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public get scale() {
        return this.base / 10;
    }
}

export class MinionAtkValue extends Value implements ISpellEffectValueWithToLevel {
    public get unit() {
        return { kind: "FIXED" } as const;
    }

    public toLevel(level: number) {
        return Math.floor(this.base + (this.base * MinionAtkValue.LEVEL_PERCENTS[level - 1]!) / 100);
    }

    public get scalesWithLevel() {
        return true;
    }

    /**
     * Percentage increase for each level of the minion's attack.
     * Notice that the percentage only increases by 10 for levels 10 and 11 instead of 20 like other levels.
     */
    private static LEVEL_PERCENTS = [0, 20, 40, 60, 80, 100, 120, 140, 160, 170, 180, 200] as const;
}

/** Dark Slash-like spells effect value increases by exactly 5 per level. */
export class FixedScaleValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public readonly scale: number;
    public constructor(arg: { base: number; scale: number }) {
        super(arg);
        this.scale = arg.scale;
    }
}

const SPELL_EFFECT_VALUE_SCALING_STRATEGIES = {
    NONE: (arg) => new NonScalingValue(arg),
    ADDITIVE_BASE_PERCENT_10: (arg) => new Percent10ScaleValue(arg),
    ADDITIVE_BASE_PERCENT_5: (arg) => new Percent5ScaleValue(arg),
    ADDITIVE_FIXED_5: (arg) => new FixedScaleValue({ ...arg, scale: 5 }),
    ADDITIVE_FIXED_2: (arg) => new FixedScaleValue({ ...arg, scale: 2 }),
    MINION_ATK: (arg) => new MinionAtkValue(arg),
} as const satisfies Record<
    keyof typeof ESpellEffectScalingStrategy,
    (arg: Pick<ISpellEffectValue, "base">) => ISpellEffectValueWithToLevel
>;

const noValues = () => [];
const withEffectiveness = (effect: TEffectWithAmountInput) => {
    const strategy =
        SPELL_EFFECT_VALUE_SCALING_STRATEGIES[
            effect.amount.scalingStrategyOverride ??
                (effect.amount.unit.kind === ESpellEffectValueUnitKind.FIXED
                    ? ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_10
                    : ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_5)
        ];
    return [strategy(effect.amount)].concat(
        effect.amount.effectiveness?.map((effectiveness) =>
            (effectiveness.scalingStrategyOverride
                ? SPELL_EFFECT_VALUE_SCALING_STRATEGIES[effectiveness.scalingStrategyOverride]
                : strategy)({
                base: effectiveness.base,
            }),
        ) ?? [],
    );
};

type TSpellEffectValueGetters = {
    [K in TSpellEffectValueGetterInput["kind"]]: (
        effect: Extract<TSpellEffectValueGetterInput, { kind: K }>,
    ) => ISpellEffectValueWithToLevel[];
};

const SPELL_EFFECT_VALUE_GETTERS: TSpellEffectValueGetters = {
    DAMAGE: withEffectiveness,
    HEAL: withEffectiveness,
    MOVEMENT: noValues,
    STAT: withEffectiveness,
    STATUS(effect) {
        return spellEffectValues(effect.effect);
    },
    REPEAT(effect) {
        return spellEffectValues(effect.effect);
    },
    WARP: noValues,
    OBSTACLE(effect) {
        return [
            SPELL_EFFECT_VALUE_SCALING_STRATEGIES.ADDITIVE_BASE_PERCENT_10({
                base: effect.hp.base,
            }),
        ];
    },
    TILE(effect) {
        return spellEffectValues(effect.repeat);
    },
    SUMMON(effect) {
        return [
            SPELL_EFFECT_VALUE_SCALING_STRATEGIES[
                effect.hp.scalingStrategyOverride ?? ESpellEffectScalingStrategy.ADDITIVE_BASE_PERCENT_10
            ]({
                base: effect.hp.base,
            }),
            SPELL_EFFECT_VALUE_SCALING_STRATEGIES[
                effect.atk.scalingStrategyOverride ?? ESpellEffectScalingStrategy.MINION_ATK
            ](effect.atk),
        ];
    },
};

const getEffectValueGetter = functify<TSpellEffectValueGetters>(SPELL_EFFECT_VALUE_GETTERS);

/**
 * Returns the numeric values for one effect as {@link ISpellEffectValueWithToLevel} entries.
 *
 * Examples:
 *
 * - Damage, heal or stat without effectiveness: one value.
 * - Damage, heal or stat with effectiveness: one value for regular damage, another for value against matching targets.
 * - Summon: one value for HP, another for Atk.
 * - Movement, warp: empty array, as movement effects' values do not scale with level.
 */
export default function spellEffectValues<K extends TSpellEffectValueGetterInput["kind"]>(
    effect: Extract<TSpellEffectValueGetterInput, { kind: K }> & { readonly kind: K },
): ISpellEffectValueWithToLevel[] {
    return getEffectValueGetter<K>(effect.kind)(effect);
}
