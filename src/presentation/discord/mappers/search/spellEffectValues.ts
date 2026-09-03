import type { PickDeep } from "type-fest";
import { SPELL_MAXIMUM_LEVEL } from "../../../../domain/game/constants.ts";
import type { ISpell } from "../../../../domain/game/models/spell.types.ts";
import type { TSpellEffectKindToEffectMap } from "../../../../domain/game/models/spellEffect.types.ts";
import type {
    ISpellEffectValue,
    ISpellEffectValueEffectivenessItem,
} from "../../../../domain/game/models/spellEffectValue.types.ts";
import {
    ESpellEffectScalingStrategy,
    ESpellEffectValueUnitKind,
} from "../../../../domain/game/models/spellEffectValue.types.ts";

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

    // Minions' Atk grows by 20% for every level until 9, then 10% until level 11, then finally 20% for level 12.
    public toLevel(level: number) {
        return level < 2
            ? this.base
            : Math.floor(this.base + (this.base * MinionAtkValue.LEVEL_PERCENTS[level - 2]!) / 100);
    }

    public get scalesWithLevel() {
        return true;
    }

    private static LEVEL_PERCENTS = [20, 40, 60, 80, 100, 120, 140, 160, 170, 180, 200] as const;
}

/** Dark Slash-like spells effect value increases by exactly 5 per level. */
export class DarkSlashValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public get unit() {
        return { kind: "PERCENT" } as const;
    }

    public get scale() {
        return 5;
    }

    public get scalesWithLevel() {
        return true;
    }
}

const SPELL_EFFECT_VALUE_SCALING_STRATEGIES = {
    NONE: (arg) => new NonScalingValue(arg),
    ADDITIVE_BASE_PERCENT_10: (arg) => new Percent10ScaleValue(arg),
    ADDITIVE_BASE_PERCENT_5: (arg) => new Percent5ScaleValue(arg),
    DARK_SLASH: (arg) => new DarkSlashValue(arg),
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
        return [
            SPELL_EFFECT_VALUE_SCALING_STRATEGIES.ADDITIVE_BASE_PERCENT_10({
                base: effect.hp.base,
            }),
        ];
    },
    TILE(effect) {
        return valuesForEffect(effect.repeat);
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
