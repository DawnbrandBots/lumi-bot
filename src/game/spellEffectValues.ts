import { SPELL_MAXIMUM_LEVEL, SPELL_MINION_ATK_SCALE_CHANGE_LEVEL } from "./constants.ts";
import type { IDamageEffect, IHealEffect, IStatEffect, TSpellEffect } from "./types.ts";
import { ESpellEffectValueUnitKind, ESpellRole, type ISpell, type ISpellEffectValue } from "./types.ts";

type TSpellValueFunctions = {
    [K in TSpellEffect["kind"]]: (effect: Extract<TSpellEffect, { kind: K }>) => ISpellEffectValueWithToLevel[];
};

export type ISpellEffectValueScaleUnit = "FIXED" | "PERCENT";

// TODO: admittedly, this name sucks. I think I should include something like "DBModel" in db-related models name so I could use "ISpellEffectValue" here for example.
// Maybe in another PR that refactors data access for this repository.
export type ISpellEffectValueWithToLevel = Omit<ISpellEffectValue, "effectiveness" | "scalesWithLevel"> &
    Required<Pick<ISpellEffectValue, "scalesWithLevel">> & {
        toLevel(level: number): number;
    };

export type ISpellEffectValueWithToLevelAndConsistentScale = ISpellEffectValueWithToLevel & {
    scale: number;
};

// TODO: shoudldn't TSpellEffectValueUnit be used in the spellvaluedefinition?

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
        // { base: effect.hp.base, scale: effect.hp.base / 10, unit: { kind: "FIXED" } }];
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
