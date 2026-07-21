import { SPELL_MAXIMUM_LEVEL, SPELL_MINION_ATK_SCALE_CHANGE_LEVEL } from "./constants.ts";
import type { IDamageEffect, IHealEffect, IStatEffect, TSpellEffect } from "./types.ts";
import { ESpellEffectValueUnitKind, ESpellRole, type ISpell, type ISpellEffectValue } from "./types.ts";

type TSpellValueFunctions = {
    [K in TSpellEffect["kind"]]: (effect: Extract<TSpellEffect, { kind: K }>) => ISpellEffectValueWithToLevel[];
};

// TODO: admittedly, this name sucks. I think I should include something like "DBModel" in db-related models name so I could use "ISpellEffectValue" here for example.
// Maybe in another PR that refactors data access for this repository.
// TODO: maybe this weird `Omit<ISpellEffectValue, "effectiveness"> &` construct is a sign I should rethink of effectiveness is represented in ISpellEffectValue.
export type ISpellEffectValueWithToLevel = Omit<ISpellEffectValue, "effectiveness"> & {
    /** Returns the effect's base value for the given level. */
    toLevel(level: number): number;
};

/** This exists because minions' Atk stats increases differently for some levels, whereas all other kind of spell effect values grow by 5 or 10% per level. */
export type ISpellEffectValueWithToLevelAndConsistentScale = ISpellEffectValueWithToLevel & {
    /** Amount by which an effect's base value increases per level. */
    scale: number;
};

const UNIT_TO_SCALE_DENOMINATOR: Record<keyof typeof ESpellEffectValueUnitKind, number> = {
    [ESpellEffectValueUnitKind.FIXED]: 10,
    [ESpellEffectValueUnitKind.PERCENT]: 20,
};

export abstract class Value implements ISpellEffectValueWithToLevel {
    public readonly base: ISpellEffectValueWithToLevel["base"];
    public readonly scalesWithLevel: ISpellEffectValueWithToLevel["scalesWithLevel"];
    public abstract readonly unit: ISpellEffectValueWithToLevel["unit"];
    public abstract toLevel(level: number): number;

    public constructor(arg: Pick<ISpellEffectValue, "base" | "scalesWithLevel">) {
        this.base = arg.base;
        this.scalesWithLevel = arg.scalesWithLevel ?? true;
    }
}

export abstract class ValueWithScale extends Value implements ISpellEffectValueWithToLevelAndConsistentScale {
    public abstract readonly scale: ISpellEffectValueWithToLevelAndConsistentScale["scale"];

    public constructor(arg: Pick<ISpellEffectValue, "base" | "scalesWithLevel">) {
        super(arg);
    }

    public toLevel(level: number) {
        return Math.floor(this.base + this.scale * (level === SPELL_MAXIMUM_LEVEL ? level : level - 1));
    }
}

/** Represents how normal spell effect values grow: 10% per level for fixed values and 5% for percent values. */
export class NormalValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public readonly unit: ISpellEffectValueWithToLevelAndConsistentScale["unit"];

    public constructor(
        arg: ConstructorParameters<typeof Value>[0] & Pick<ISpellEffectValueWithToLevelAndConsistentScale, "unit">,
    ) {
        super(arg);
        this.unit = arg.unit;
    }

    public get scale() {
        if (!this.scalesWithLevel) {
            return 0;
        }

        return this.base / UNIT_TO_SCALE_DENOMINATOR[this.unit.kind];
    }
}

const MINION_ATK_SCALE_DENOMINATOR_BEFORE_SCALE_CHANGE_LEVEL = 5;
const MINION_ATK_SCALE_DENOMINATOR_AFTER_SCALE_CHANGE_LEVEL = 10;

export class MinionAtkValue extends Value implements ISpellEffectValueWithToLevel {
    public constructor(arg: ConstructorParameters<typeof Value>[0]) {
        super(arg);
    }

    public get unit() {
        return { kind: "FIXED" } as const;
    }

    // Minions' Atk grows by 20% for every level until 9, then 10% until level 11, then finally 20% for level 12.
    public toLevel(level: number) {
        if (!this.scalesWithLevel) {
            return this.base;
        }

        const scaleBeforeScaleChangeLevel = this.base / MINION_ATK_SCALE_DENOMINATOR_BEFORE_SCALE_CHANGE_LEVEL;
        if (level < SPELL_MINION_ATK_SCALE_CHANGE_LEVEL) {
            return Math.floor(this.base + scaleBeforeScaleChangeLevel * (level - 1));
        }

        const scaleAfterScaleChangeLevel = this.base / MINION_ATK_SCALE_DENOMINATOR_AFTER_SCALE_CHANGE_LEVEL;
        return Math.floor(
            this.base +
                scaleBeforeScaleChangeLevel * (SPELL_MINION_ATK_SCALE_CHANGE_LEVEL - 2) +
                scaleAfterScaleChangeLevel *
                    ((level === SPELL_MAXIMUM_LEVEL ? level + 1 : level) - (SPELL_MINION_ATK_SCALE_CHANGE_LEVEL - 1)),
        );
    }
}

/** Dark Slash-like spells effect value increases by exactly 5 per level. */
export class DarkSlashValue extends ValueWithScale implements ISpellEffectValueWithToLevelAndConsistentScale {
    public get unit() {
        return { kind: "PERCENT" } as const;
    }

    public get scale() {
        if (!this.scalesWithLevel) {
            return 0;
        }

        return 5;
    }
}

const noValues = () => [];
const withEffectiveness = (effect: IDamageEffect | IHealEffect | IStatEffect) => {
    return [new NormalValue(effect.amount)].concat(
        effect.amount.effectiveness?.map(
            (eff) =>
                new NormalValue({
                    base: eff.base,
                    scalesWithLevel: effect.amount.scalesWithLevel,
                    unit: effect.amount.unit,
                }),
        ) ?? [],
    );
};

const SPELL_EFFECT_VALUE_GETTERS: TSpellValueFunctions = {
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
    ICE_BLOCK(effect) {
        return [
            new NormalValue({
                base: effect.hp.base,
                scalesWithLevel: effect.hp.scalesWithLevel,
                unit: { kind: "FIXED" },
            }),
        ];
    },
    TILE(effect) {
        return valuesForEffect(effect.repeat);
    },
    SUMMON(effect) {
        return [
            new NormalValue({
                base: effect.hp.base,
                scalesWithLevel: effect.hp.scalesWithLevel,
                unit: { kind: "FIXED" },
            }),
            new MinionAtkValue(effect.atk),
        ];
    },
};

function valuesForEffect<K extends TSpellEffect["kind"]>(
    effect: Extract<TSpellEffect, { kind: K }>,
): ISpellEffectValueWithToLevel[] {
    return SPELL_EFFECT_VALUE_GETTERS[effect.kind](effect);
}

/**
 * Returns an array of arrays of ${@link ISpellEffectValueWithToLevel} for each spell effect which has at least one value that scales with the spell's level.
 *
 * Some examples with actual spells from the game:
 *
 * - "Aether EX" as argument returns an array with two subarrays, each with one entry: the first subarray's entry represents damage while the second subarray's entry represents healing.
 * - "Crossedge Boost EX" as argument returns an array with two subarrays:
 *   1. Subarray with one entry for the Atk stat boost.
 *   2. Subarray with two entries: one for the movement boost applied to Infantry units, the other for non-Infantry units (0).
 * - "Distant Thunder" as argument returns an array with one subarray with two entries: one for the regular damage and the other for damage dealt to ranged units.
 * - Any minion spell as argument returns an array with one subarray with two entries: one for the minion's HP and the other for Atk.
 * - "Heal Pull" as argument returns an array with one subarray with only an entry for the Heal effect since Movement does not scale with a spell's level.
 * - "Minor Pull" as argument returns an empty table since it only has one effect that does not scale with the spell's level.
 */
export function spellEffectsValues(spell: ISpell): ISpellEffectValueWithToLevel[][] {
    if (
        spell.effects.length === 1 &&
        spell.effects[0]!.kind === "DAMAGE" &&
        spell.role.kind === ESpellRole.SHADOW &&
        spell.effects[0]!.amount.unit.kind === ESpellEffectValueUnitKind.PERCENT
    ) {
        return [[new DarkSlashValue(spell.effects[0]!.amount)]];
    }
    return spell.effects.map(valuesForEffect);
}
