export type TId = string;

export interface IColor {
    readonly kind: "color";
    readonly id: TId;
    readonly name: string;
    readonly strongAgainst: IColor | null | undefined;
    readonly weakAgainst: IColor | null | undefined;
}

export interface IWeaponType {
    readonly kind: "weaponType";
    readonly id: TId;
    readonly name: string;
    readonly color: IColor;
    readonly range: number;
    readonly discipleBaseAtkModifier: number;
}

export interface IWeaponSkillEffect {
    readonly kind: "weaponSkillEffect";
    readonly id: TId;
}

export interface IWeaponSkill {
    readonly kind: "weaponSkill";
    readonly id: TId;
    readonly name: string;
    readonly effect: IWeaponSkillEffect;
    readonly weapons: Iterable<IWeapon>;
    readonly description: string;
}

export interface IWeapon {
    readonly kind: "weapon";
    readonly id: TId;
    readonly name: string;
    readonly weaponType: IWeaponType;
    readonly level: number;
    readonly hp: number;
    readonly atk: number;
    readonly uniqueSkill: IWeaponSkill;
    readonly freeSkillSlots: number;
    readonly prfDisciple: IDisciple;
    readonly getWeaponVariantStat: (args: { variant: "HP" | "NEUTRAL" | "ATK", stat: "hp" | "atk" }) => number
}

export interface IMovementType {
    readonly kind: "movement";
    readonly id: TId;
    readonly name: string;
    readonly distance: number;
    readonly canTraverseWaterTiles: boolean;
    readonly discipleBaseHpModifier: number;
    readonly discipleBaseAtkModifier: number;
}

export interface IDisciple {
    readonly kind: "disciple";
    readonly id: TId;
    readonly name: string;
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    readonly prfWeapon: IWeapon;
    readonly spells: Iterable<ISpell>;

    readonly baseAtk: number;
    readonly baseHp: number;

    readonly getAtk: ({ level }: { level: number }) => number;
    readonly getHp: ({ level }: { level: number }) => number;
}

export type TSpellRole = "EX" | "LIGHT" | "SHADOW"

export interface ISpellRole {
    readonly kind: TSpellRole
    readonly name: string
}

export interface ISpellShape {
    readonly id: string
    readonly name: string
    /**
     * 25 characters representing tiles part of a shape.
     * - `X` for the tile in the shape that's dragged on the battle grid
     * - `O` for other tiles part of the shape
     * - `.` for tiles not part of the shape
     */
    readonly tiles: string
}

export interface ISpell {
    readonly kind: "spell",
    readonly id: TId,
    readonly name: string,
    readonly disciple: IDisciple,
    readonly role: ISpellRole
    readonly uses: number | null | undefined
    readonly cooldown: number
    readonly effects: ISpellEffect[]
    readonly shape: ISpellShape;
}

export type TStat = "HP" | "ATK" | "RECEIVED_WEAPON_DAMAGE" | "RECEIVED_SPELL_DAMAGE" | "COLOR_AFFINITY";
export type TDirection = "UP" | "DOWN";
export type TStatChange = "INCREASE" | "DECREASE"
export type TSpellValueUnitKind = "FIXED" | "PERCENT"

export type TStatDTO = TStat
export type TDirectionDTO = TDirection
export type TStatChangeDTO = TStatChange
export type TSpellValueUnitKindDTO = TSpellValueUnitKind

export interface ISpellValueUnit {
    readonly kind: TSpellValueUnitKind;
    readonly format: ({ base }: { base: number }) => string;
}

export interface ISpellValueUnitDTO {
    readonly kind: TSpellValueUnitKindDTO;
}

export interface ISpellValueFixedUnit extends ISpellValueUnit {
    readonly kind: "FIXED";
}

export interface ISpellValueFixedUnitDTO extends ISpellValueUnitDTO {
    readonly kind: "FIXED";
}

export interface ISpellValuePercentUnit extends ISpellValueUnit {
    readonly kind: "PERCENT";
    readonly stat: IStat;
}

export interface ISpellValuePercentUnitDTO extends ISpellValueUnitDTO {
    readonly kind: "PERCENT";
    readonly stat: TStatDTO;
}

// TODO: non-DTO TSpellValueEffectivenessItem must refer to some selector (eg. range = 2, movementType = CAVALRY, etc...)
export interface ISpellValueEffectivenessItem {
    readonly kind: string;
    readonly base: number;
}

export type TSpellValueUnitDTO = ISpellValueFixedUnitDTO | ISpellValuePercentUnitDTO
export interface ISpellValueEffectivenessItemDTO {
    readonly kind: string;
    readonly base: number;
}

export interface ISpellValue {
    readonly base: number;
    readonly unit: ISpellValueUnit
    // TODO: null on top of ?: is annoying
    readonly effectiveness?: ISpellValueEffectivenessItem[] | null
};

export interface ISpellValueDTO {
    readonly base: number;
    readonly unit: TSpellValueUnitDTO
    readonly effectiveness?: ISpellValueEffectivenessItemDTO[]
};

export interface IStat {
    readonly id: TId;
    readonly name: string;
}

export interface IDirection {
    readonly id: TId;
    readonly noun: string;
}

export interface IStatChange {
    readonly id: TId;
    readonly verb: string;
}

export type TSpellEffectTargetDTO = "ANY" | "SELF" | "DUAL";
export type TSpellEffectTarget = TSpellEffectTargetDTO;

export interface ISpellEffectTarget {
    readonly kind: TSpellEffectTarget;
    readonly asString: string;
}

export interface ISpellEffectDTO {
    readonly kind: string;
    readonly target?: TSpellEffectTargetDTO | null;
}

export interface ISpellEffect {
    readonly kind: string;
    readonly target?: ISpellEffectTarget | null;
    readonly description: string;
}

export interface IDamageEffectDTO extends ISpellEffectDTO {
    readonly kind: "DAMAGE";
    readonly amount: ISpellValue;
    readonly color: TId;
}

export interface IDamageEffect extends ISpellEffect {
    readonly kind: "DAMAGE";
    readonly amount: ISpellValue;
    readonly color: IColor;
}

export interface IHealEffectDTO extends ISpellEffectDTO {
    readonly kind: "HEAL";
    readonly amount: ISpellValueDTO;
}

export interface IHealEffect extends ISpellEffect {
    readonly kind: "HEAL";
    readonly amount: ISpellValue;
}

export interface IMovementEffectDTO extends ISpellEffectDTO {
    readonly kind: "MOVEMENT";
    readonly direction: TDirectionDTO;
    readonly count: number;
    readonly target: TSpellEffectTargetDTO;
}

export interface IMovementEffect extends ISpellEffect {
    readonly kind: "MOVEMENT";
    readonly direction: IDirection;
    readonly count: number;
    readonly target: ISpellEffectTarget;
}

export interface IStatEffectDTO extends ISpellEffectDTO {
    readonly kind: "STAT";
    readonly statChange: TStatChangeDTO
    readonly amount: ISpellValueDTO
    readonly duration: number | null | undefined
    readonly stat: TStatDTO
}

export interface IStatEffect extends ISpellEffect {
    readonly kind: "STAT";
    readonly statChange: IStatChange
    readonly amount: ISpellValue
    readonly duration: number | null | undefined
    readonly stat: IStat
}

export interface IStatusEffectDTO extends ISpellEffectDTO {
    readonly kind: "STATUS";
    readonly effect: IStatEffectDTO | IRepeatEffectDTO
    readonly target: TSpellEffectTargetDTO;
}

export interface IStatusEffect extends ISpellEffect {
    readonly kind: "STATUS";
    readonly effect: IStatEffect | IRepeatEffect
    readonly target: ISpellEffectTarget;
}

export interface IRepeatEffectDTO extends ISpellEffectDTO {
    readonly kind: "REPEAT";
    readonly effect: IDamageEffectDTO | IHealEffectDTO;
    readonly times: number;
    readonly interval: number;
}

export interface IRepeatEffect extends ISpellEffect {
    readonly kind: "REPEAT";
    readonly effect: IDamageEffect | IHealEffect;
    readonly times: number;
    readonly interval: number;
}

export interface IWarpEffectDTO extends ISpellEffectDTO {
    readonly kind: "WARP";
}

export interface IWarpEffect extends ISpellEffect {
    readonly kind: "WARP";
}

export interface IIceBlockEffectDTO extends ISpellEffectDTO {
    readonly kind: "ICE_BLOCK";
    readonly hp: number;
}

export interface IIceBlockEffect extends ISpellEffect {
    readonly kind: "ICE_BLOCK";
    readonly hp: number;
}

export interface ITileEffectDTO extends ISpellEffectDTO {
    readonly kind: "TILE";
    readonly repeat: IRepeatEffectDTO;
}

export interface ITileEffect extends ISpellEffect {
    readonly kind: "TILE";
    readonly repeat: IRepeatEffect;
}

export interface ISummonEffectDTO extends ISpellEffectDTO {
    readonly kind: "SUMMON";
    readonly movementType: TId;
    readonly weaponType: TId;
    readonly hp: { base: number, scale?: number | null };
    readonly atk: { base: number, scale?: number | null };
}

export interface ISummonEffect extends ISpellEffect {
    readonly kind: "SUMMON";
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    // TODO: a proper type will be needed to compute value at various levels
    readonly hp: { base: number, scale?: number | null };
    readonly atk: { base: number, scale?: number | null };
}

export type TSpellEffectDTO = IDamageEffectDTO
    | IHealEffectDTO
    | IMovementEffectDTO
    | IStatEffectDTO
    | IStatusEffectDTO
    | IRepeatEffectDTO
    | IWarpEffectDTO
    | IIceBlockEffectDTO
    | ITileEffectDTO
    | ISummonEffectDTO

export type TSpellEffect = IDamageEffect
    | IHealEffect
    | IMovementEffect
    | IStatEffect
    | IStatusEffect
    | IRepeatEffect
    | IWarpEffect
    | IIceBlockEffect
    | ITileEffect
    | ISummonEffect