import { SPELL_MAXIMUM_LEVEL } from "./constants.ts";
import type { IDamageEffect, IHealEffect, IStatEffect, TSpellEffect } from "./types.ts";
import { ESpellEffectValueUnitKind, ESpellRole, type ISpell, type ISpellEffectValue } from "./types.ts";

type TSpellValueFunctions = {
    [K in TSpellEffect["kind"]]: (
        effect: Extract<TSpellEffect, { kind: K }>,
        // spell: ISpell,
    ) => ISpellEffectValueWithScale[];
};

export type ISpellEffectValueScaleUnit = "FIXED" | "PERCENT";

// export type ISpellEffectValueScale = ISpellEffectValue & {
//     value: number;
//     unit: ISpellEffectValueScaleUnit;
// };
export type ISpellEffectValueWithScale = Omit<ISpellEffectValue, "effectiveness" | "scalesWithLevel"> & {
    scalesWithLevel: boolean;
    scale: number;
    // scale: ISpellEffectValueScale;
    toLevel(level: number): number;
};

// TODO: shoudldn't TSpellEffectValueUnit be used in the spellvaluedefinition?

export abstract class Value implements ISpellEffectValueWithScale {
    public readonly base: ISpellEffectValueWithScale["base"];
    public readonly scalesWithLevel: ISpellEffectValueWithScale["scalesWithLevel"];
    public abstract readonly unit: ISpellEffectValueWithScale["unit"];
    public abstract readonly scale: ISpellEffectValueWithScale["scale"];

    public constructor(arg: Pick<ISpellEffectValue, "base" | "scalesWithLevel">) {
        this.base = arg.base;
        this.scalesWithLevel = arg.scalesWithLevel ?? true;
    }

    public toLevel(level: number) {
        return Math.floor(this.base + this.scale * (level === SPELL_MAXIMUM_LEVEL ? level : level - 1));
    }
}

export class NormalValue extends Value implements ISpellEffectValueWithScale {
    public readonly unit: ISpellEffectValueWithScale["unit"];

    public constructor(arg: ConstructorParameters<typeof Value>[0] & Pick<ISpellEffectValueWithScale, "unit">) {
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

export class MinionAtkValue extends Value implements ISpellEffectValueWithScale {
    public constructor(arg: ConstructorParameters<typeof Value>[0]) {
        super(arg);
    }

    public get unit() {
        return { kind: "FIXED" } as const;
    }

    public get scale() {
        if (!this.scalesWithLevel) {
            return 0;
        }

        return this.base / 5;
    }
}

export class DarkSlashValue extends Value implements ISpellEffectValueWithScale {
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

const UNIT_TO_SCALE_DENOMINATOR: Record<keyof typeof ESpellEffectValueUnitKind, number> = {
    [ESpellEffectValueUnitKind.FIXED]: 10,
    [ESpellEffectValueUnitKind.PERCENT]: 20,
};

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
    // effect: TSpellEffect & { kind: K },
    effect: Extract<TSpellEffect, { kind: K }>,
): ISpellEffectValueWithScale[] {
    return SPELL_EFFECT_VALUE_GETTERS[effect.kind](effect);
}

export function spellEffectsValues(spell: ISpell): ISpellEffectValueWithScale[][] {
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
