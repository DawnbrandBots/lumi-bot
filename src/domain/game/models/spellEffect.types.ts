import type { IColor } from "./color.types.ts";
import type { EDirection } from "./direction.types.ts";
import type { IMovementType } from "./movement.types.ts";
import type { ISpellShape } from "./spell.types.ts";
import type { ESpellEffectScalingStrategy, ISpellEffectValue } from "./spellEffectValue.types.ts";
import type { EStat } from "./stat.types.ts";
import type { EStatChange } from "./statChange.types.ts";
import type { IWeaponType } from "./weaponType.types.ts";

export const ESpellEffectTarget = {
    /** Effect targets tile the spell was dragged on. */
    ANY: "ANY",
    /** Effect targets spell user's tile. */
    SELF: "SELF",
    /** Effect targets targets and spell user's tiles. */
    DUAL: "DUAL",
} as const;

/** Which tiles are targeted by a spell effect. */
export interface ISpellEffectTarget {
    readonly kind: keyof typeof ESpellEffectTarget;
    readonly asString: string;
}

/** For summon effects. Eg. HP and Atk of the summoned unit. */
// TODO: scale property added in later PR
export interface ISummonEffectStatValue {
    readonly base: number;
    readonly scalingStrategyOverride?: keyof typeof ESpellEffectScalingStrategy | null;
}

export const ESpellEffectKind = {
    DAMAGE: "DAMAGE",
    HEAL: "HEAL",
    MOVEMENT: "MOVEMENT",
    STAT: "STAT",
    STATUS: "STATUS",
    REPEAT: "REPEAT",
    WARP: "WARP",
    OBSTACLE: "OBSTACLE",
    TILE: "TILE",
    SUMMON: "SUMMON",
} as const;

/**
 * Purely visual characteristic in battle and spell icons as of 1.10, not even mentioned in spell descriptions.
 * Will this be relevant in later updates?
 */
export const EObstacleType = {
    ICE: "ICE",
    ROCK: "ROCK",
} as const;

export const ESpellEffectTileType = {
    GROUND: "GROUND",
    WATER: "WATER",
    WALL: "WALL",
} as const;

export type TSpellEffectKindToEffectMap = {
    DAMAGE: IDamageEffect;
    HEAL: IHealEffect;
    MOVEMENT: IMovementEffect;
    STAT: IStatEffect;
    STATUS: IStatusEffect;
    REPEAT: IRepeatEffect;
    WARP: IWarpEffect;
    OBSTACLE: IObstacleEffect;
    TILE: ITileEffect;
    SUMMON: ISummonEffect;
};

/** Something that occurs on tiles a spell is dragged on, and affects units on these tiles. */
export interface ISpellEffect {
    readonly kind: (typeof ESpellEffectKind)[keyof typeof ESpellEffectKind];
    readonly target?: keyof typeof ESpellEffectTarget | null;
    /**
     * Most spells' effects share the same shape, which is why "shape" is a property of the spell and not spell effect.
     * There are few exceptions: Crosswind Lock EX was the first spell introduced in an update to break the rule.
     */
    readonly shapeOverride?: ISpellShape | null;
}

/** Effect that deals damage to units. */
export interface IDamageEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.DAMAGE;
    readonly amount: ISpellEffectValue;
    readonly color: IColor;
}

/** Effect that restores HP to units. */
export interface IHealEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.HEAL;
    readonly amount: ISpellEffectValue;
}

/** Effect that moves units. */
export interface IMovementEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.MOVEMENT;
    readonly direction: keyof typeof EDirection;
    readonly count: number;
    readonly target: keyof typeof ESpellEffectTarget;
}

/** Effect that influences the receiver's stats. */
export interface IStatEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.STAT;
    readonly statChange: keyof typeof EStatChange;
    readonly amount: ISpellEffectValue;
    readonly duration: number | null | undefined;
    readonly stat: keyof typeof EStat;
}

/** Effect that grants a status effect. */
export interface IStatusEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.STATUS;
    readonly effect: IStatEffect | IRepeatEffect;
    readonly target: keyof typeof ESpellEffectTarget;
}

/** Effect that repeats another effect a certain number of times. */
export interface IRepeatEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.REPEAT;
    readonly effect: IDamageEffect | IHealEffect;
    readonly times: number;
    readonly interval: number;
}

/** Effect moves user to target tile. */
export interface IWarpEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.WARP;
}

/** Effect that summons obstacles on tiles. */
export interface IObstacleEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.OBSTACLE;
    readonly obstacleType: keyof typeof EObstacleType;
    readonly onlyOn?: keyof typeof ESpellEffectTileType | null;
    readonly hp: ISummonEffectStatValue;
}

/** Effect that grants effects to tiles. */
export interface ITileEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.TILE;
    readonly repeat: IRepeatEffect;
}

/** Effect that summons units on your side. */
export interface ISummonEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.SUMMON;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    readonly hp: ISummonEffectStatValue;
    readonly atk: ISummonEffectStatValue;
}

/** Spell effects which do not only appear as nested inside other effects. */
export type TRootSpellEffect =
    | IDamageEffect
    | IHealEffect
    | IMovementEffect
    | IStatusEffect
    | IWarpEffect
    | IObstacleEffect
    | ITileEffect
    | ISummonEffect;

export type TSpellEffect = TRootSpellEffect | IStatEffect | IRepeatEffect;
