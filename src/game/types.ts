export type TId = string;

/**
 * Spells and weapon types have a color which influences damage calculations.
 *
 * Typically in Fire Emblem: Red > Green > Blue > Red.
 */
export interface IColor {
    readonly kind: "color";
    readonly id: TId;
    readonly name: string;
    /**
     * Color against which this one deals more damage.
     */
    readonly strongAgainst: IColor | null | undefined;
    /**
     * Color against which this one deals less damage.
     */
    readonly weakAgainst: IColor | null | undefined;
}

/**
 * The kind of weapons a unit may wield. (eg. Sword, Lance, Axe...)
 */
export interface IWeaponType {
    readonly kind: "weaponType";
    readonly id: TId;
    readonly name: string;
    readonly color: IColor;
    /**
     * Number of tiles from which a unit may auto attack another one.
     */
    readonly range: 1 | 2;
    readonly weaponSkills: Iterable<IWeaponSkill>;
}

// TODO: Actually represents a join table, not an in-game concept.
export interface IWeaponTypeWeaponSkill {
    readonly kind: "weaponTypeWeaponSkill";
    readonly weaponType: IWeaponType;
    readonly weaponSkill: IWeaponSkill;
    /**
     * Number in weapon type skill name (eg. 1 for "Armor Bane 1").
     */
    readonly rank: 1 | 2 | 3;
}

/**
 * Effect that a weapon skill grants.
 *
 * Multiple weapon skills may grant the same effect.
 */
export interface IWeaponSkillEffect {
    readonly kind: "weaponSkillEffect";
    readonly id: TId;
    // TODO: in the future, description's type could be replaced with a more complex type (similar to SpellEffect)
    // that can be used as part of stats and damage computations
    readonly description: string;
}

/**
 * Passives that can be infused to weapons to influence stat and damage computations.
 */
export interface IWeaponSkill {
    readonly kind: "weaponSkill";
    readonly id: TId;
    readonly name: string;
    readonly effect: IWeaponSkillEffect;
    /**
     * Weapons which possess this skill as a unique skill.
     */
    readonly uniqueSkillWeapons: Iterable<IWeapon>;
    readonly weaponTypeWeaponSkills: Iterable<IWeaponTypeWeaponSkill>;
    readonly description: string;
}

/**
 * A weapon that can be equipped by disciples.
 */
export interface IWeapon {
    readonly kind: "weapon";
    readonly id: TId;
    readonly name: string;
    readonly weaponType: IWeaponType;
    /**
     * Minimum level required by a disciple to wield this weapon.
     */
    readonly level: number;
    readonly hp: number;
    readonly atk: number;
    /**
     * Weapons of certain types have an immutable weapon skill.
     */
    readonly weaponTypeSkill?: IWeaponSkill | null;
    /**
     * Weapons may have a weapon skill that cannot be removed.
     */
    readonly uniqueSkill?: IWeaponSkill | null;
    /**
     * How many additional weapon skills may be infused to this weapon.
     */
    readonly freeSkillSlots: number;
    /**
     * Only disciple by which this weapon can be wielded.
     */
    readonly prfDisciple?: IDisciple | null;
    /**
     * A weapon has an immutable variant which influences the stats modifiers it grants to its wielder.
     *
     * @returns The value of the modifier for the given variant and stat.
     */
    getWeaponVariantStat(args: { variant: "HP" | "NEUTRAL" | "ATK"; stat: "hp" | "atk" }): number;
}

/** Stat modifier possessed by every weapon (except at level 1) that cannot be changed. */
export interface IWeaponVariant {
    readonly kind: "HP" | "NEUTRAL" | "ATK";
    readonly hp: number;
    readonly atk: number;
}

/**
 * A unit has a movement type which influences its stats and how it walks on the grid.
 */
export interface IMovementType {
    readonly kind: "movement";
    readonly id: TId;
    readonly name: string;
    /**
     * Maximum number of walked tiles per turn.
     */
    readonly distance: number;
    readonly canTraverseWaterTiles: boolean;
    readonly baseHp: number;
    readonly baseAtkByRange: Readonly<Record<IWeaponType["range"], number>>;
}

/**
 * An unlockable character.
 */
export interface IDisciple {
    readonly kind: "disciple";
    readonly id: TId;
    readonly name: string;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    /**
     * All disciples have one weapon that only they can equip.
     */
    readonly prfWeapon: IWeapon;
    /**
     * Music that plays when this disciple is revealed to be the Shadow.
     */
    readonly shadowMusic: IMusic;
    /**
     * Music that plays when this disciple the Shadow and the battle is over.
     */
    readonly shadowResultsScreenMusic: IMusic;
    /**
     * Spells this disciple provides as their souls are collected.
     */
    readonly spells: Iterable<ISpell>;
    /**
     * Atk value at level 1.
     */
    readonly baseAtk: number;
    /**
     * HP value at level 1.
     */
    readonly baseHp: number;
    /**
     * @returns Atk value for the given level.
     */
    getAtk({ level }: { level: number }): number;
    /**
     * @returns HP value for the given level.
     */
    getHp({ level }: { level: number }): number;
}

export const ESpellRole = {
    /**
     * Spell usable by one disciple only, no matter the side.
     */
    EX: "EX",
    /**
     * Spell usable when fighting for the Light.
     */
    LIGHT: "LIGHT",
    /**
     * Spell usable when fighting for the Shadow.
     */
    SHADOW: "SHADOW",
} as const;

/**
 * Role by which a spell can be used.
 */
export interface ISpellRole {
    readonly kind: keyof typeof ESpellRole;
    readonly name: string;
}

/**
 * Tiles that will be affected by a spell when dragged on the grid.
 */
export interface ISpellShape {
    readonly id: string;
    readonly name: string;
    /**
     * 25 characters representing tiles part of a shape.
     * - `X` for the tile in the shape that's dragged on the battle grid
     * - `O` for other tiles part of the shape
     * - `.` for tiles not part of the shape
     */
    readonly tiles: string;
    /**
     * Covers more than one tile.
     */
    readonly isAoe: boolean;
}

export const ESpellDraggingMode = {
    /**
     * Spell targets tile on which it was dragged.
     */
    ANY: "ANY",
    /**
     * Spell targets user no matter which tile it was dragged on.
     */
    SELF: "SELF",
} as const;

/**
 * Determines which units are targeted by a spell depending on where it was dragged on the grid.
 */
export interface ISpellDraggingMode {
    readonly kind: keyof typeof ESpellDraggingMode;
    readonly asString: string;
}

/**
 * Referred to as "magic skill" in Fire Emblem Shadows.
 */
export interface ISpell {
    readonly kind: "spell";
    readonly id: TId;
    readonly name: string;
    /**
     * Disciple who provides the spell.
     *
     * Some spells, like "Minor" ones, don't have an associated disciple.
     */
    readonly disciple?: IDisciple | null;
    readonly role: ISpellRole;
    /**
     * Number of times this spell can be used.
     *
     * `null` means an infinite number of times.
     */
    // TODO: using Infinity might be a better fit?
    readonly uses: number | null | undefined;
    /**
     * Seconds between this spell is used and its effects are applied. Only concerns some Shadow spells.
     *
     * `null`ish means no countdown.
     */
    readonly countdown?: number | null;
    /**
     * Seconds the player must wait to use another spell after using this one.
     */
    readonly cooldown: number;
    /**
     * Effects created by the spell when dragged on the grid, in order of activation.
     */
    readonly effects: TRootSpellEffect[];
    readonly shape: ISpellShape;
    /**
     * Kind of units that this spell can only be used by.
     */
    readonly onlyFor?: IMovementType | IWeaponType | null;
    readonly draggingMode: ISpellDraggingMode;
}

export const EStat = {
    HP: "HP",
    ATK: "ATK",
    RECEIVED_WEAPON_DAMAGE: "RECEIVED_WEAPON_DAMAGE",
    RECEIVED_SPELL_DAMAGE: "RECEIVED_SPELL_DAMAGE",
    MOVEMENT: "MOVEMENT",
    COLOR_AFFINITY: "COLOR_AFFINITY",
    COOLDOWN: "COOLDOWN",
} as const;

export const EDirection = {
    UP: "UP",
    DOWN: "DOWN",
} as const;

export const EStatChange = {
    INCREASE: "INCREASE",
    DECREASE: "DECREASE",
    LIMIT: "LIMIT",
} as const;

export const ESpellEffectValueUnitKind = {
    /**
     * Value is exactly the value described.
     */
    FIXED: "FIXED",
    /**
     * Value is a percentage of a stat of the spell user.
     */
    PERCENT: "PERCENT",
} as const;

export const EWeaponVariant = {
    HP: "HP",
    NEUTRAL: "NEUTRAL",
    ATK: "ATK",
} as const;

export interface ISpellEffectValueUnit {
    readonly kind: keyof typeof ESpellEffectValueUnitKind;
}

export interface ISpellEffectValueFixedUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.FIXED;
}

export interface ISpellEffectValuePercentUnit extends ISpellEffectValueUnit {
    readonly kind: typeof ESpellEffectValueUnitKind.PERCENT;
    readonly stat: IStat;
}

export type TSpellEffectValueUnit = ISpellEffectValueFixedUnit | ISpellEffectValuePercentUnit;

/**
 * Specifies a different value for spell effects when targets belong to a certain group.
 *
 * For example: Arrow spells' effect have 40 base damage against Flying units instead of the normal 25.
 */
export interface ISpellEffectValueEffectivenessItem {
    readonly kind: string;
    readonly base: number;
}

/**
 * Spell effects have values which may vary with level and targeted units.
 *
 * Eg. X damage, X HP restored, stat drops by X percent...
 */
export interface ISpellEffectValue {
    /**
     * Value of spell effect for the spell's level 1.
     */
    readonly base: number;
    readonly scalesWithLevel: boolean;
    readonly unit: ISpellEffectValueUnit;
    readonly effectiveness?: ISpellEffectValueEffectivenessItem[] | null;
}

/**
 * Describes a unit's stat. Eg. Atk, HP, Movement...
 */
export interface IStat {
    readonly id: keyof typeof EStat;
    readonly name: string;
}

/**
 * For movement spells. Eg. UP and DOWN.
 */
export interface IDirection {
    readonly id: keyof typeof EDirection;
    readonly noun: string;
}

/**
 * For stat spell effects. Eg; INCREASE and DECREASE.
 */
export interface IStatChange {
    readonly id: keyof typeof EStatChange;
    readonly verb: string;
    readonly preposition: string;
}

export const ESpellEffectTarget = {
    /**
     * Effect targets tile the spell was dragged on.
     */
    ANY: "ANY",
    /**
     * Effect targets spell user's tile.
     */
    SELF: "SELF",
    /**
     * Effect targets targets and spell user's tiles.
     */
    DUAL: "DUAL",
} as const;

/**
 * Which tiles are targeted by a spell effect.
 */
export interface ISpellEffectTarget {
    readonly kind: keyof typeof ESpellEffectTarget;
    readonly asString: string;
}

/**
 * For summon effects. Eg. HP and Atk of the summoned unit.
 */
// TODO: scale property added in later PR
export interface ISummonEffectStatValue {
    readonly base: number;
    readonly scalesWithLevel: boolean;
}

export const ESpellEffectKind = {
    DAMAGE: "DAMAGE",
    HEAL: "HEAL",
    MOVEMENT: "MOVEMENT",
    STAT: "STAT",
    STATUS: "STATUS",
    REPEAT: "REPEAT",
    WARP: "WARP",
    ICE_BLOCK: "ICE_BLOCK",
    TILE: "TILE",
    SUMMON: "SUMMON",
} as const;

export type TSpellEffectKindToEffectMap = {
    DAMAGE: IDamageEffect;
    HEAL: IHealEffect;
    MOVEMENT: IMovementEffect;
    STAT: IStatEffect;
    STATUS: IStatusEffect;
    REPEAT: IRepeatEffect;
    WARP: IWarpEffect;
    ICE_BLOCK: IIceBlockEffect;
    TILE: ITileEffect;
    SUMMON: ISummonEffect;
};

/**
 * Something that occurs on tiles a spell is dragged on, and affects units on these tiles.
 */
export interface ISpellEffect {
    readonly kind: (typeof ESpellEffectKind)[keyof typeof ESpellEffectKind];
    readonly target?: ISpellEffectTarget | null;
}

/**
 * Effect that deals damage to units.
 */
export interface IDamageEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.DAMAGE;
    readonly amount: ISpellEffectValue;
    readonly color: IColor;
}

/**
 * Effect that restores HP to units.
 */
export interface IHealEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.HEAL;
    readonly amount: ISpellEffectValue;
}

/**
 * Effect that moves units.
 */
export interface IMovementEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.MOVEMENT;
    readonly direction: IDirection;
    readonly count: number;
    readonly target: ISpellEffectTarget;
}

/**
 * Effect that influences the receiver's stats.
 */
export interface IStatEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.STAT;
    readonly statChange: IStatChange;
    readonly amount: ISpellEffectValue;
    readonly duration: number | null | undefined;
    readonly stat: IStat;
}

/**
 * Effect that grants a status effect.
 */
export interface IStatusEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.STATUS;
    readonly effect: IStatEffect | IRepeatEffect;
    readonly target: ISpellEffectTarget;
}

/**
 * Effect that repeats another effect a certain number of times.
 */
export interface IRepeatEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.REPEAT;
    readonly effect: IDamageEffect | IHealEffect;
    readonly times: number;
    readonly interval: number;
}

/**
 * Effect moves user to target tile.
 */
export interface IWarpEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.WARP;
}

/**
 * Effect that summons Ice Blocks on tiles.
 */
export interface IIceBlockEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.ICE_BLOCK;
    readonly hp: ISummonEffectStatValue;
}

/**
 * Effect that grants effects to tiles.
 */
export interface ITileEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.TILE;
    readonly repeat: IRepeatEffect;
}

/**
 * Effect that summons units on your side.
 */
export interface ISummonEffect extends ISpellEffect {
    readonly kind: typeof ESpellEffectKind.SUMMON;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    readonly hp: ISummonEffectStatValue;
    readonly atk: ISummonEffectStatValue;
}

/**
 * Spell effects which do not only appear as nested inside other effects.
 */
export type TRootSpellEffect =
    | IDamageEffect
    | IHealEffect
    | IMovementEffect
    | IStatusEffect
    | IWarpEffect
    | IIceBlockEffect
    | ITileEffect
    | ISummonEffect;

export type TSpellEffect = TRootSpellEffect | IStatEffect | IRepeatEffect;

export interface IMusic {
    readonly kind: "music";
    readonly id: TId;
    readonly name: string;
    /**
     * URL to media for this music.
     */
    readonly url?: string | null;
    /**
     * Shadow disciples for which this song plays during battle.
     */
    readonly shadowMusicFor?: Iterable<IDisciple> | null;
    /**
     * Shadow disciples for which this song plays on a battle's results screen.
     */
    readonly shadowResultsScreenMusicFor?: Iterable<IDisciple> | null;
}
