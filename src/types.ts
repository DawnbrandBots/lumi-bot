export type TId = string;

export interface IColor {
    readonly kind: "color";
    readonly id: TId;
    readonly name: string;
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
    readonly weapons: Iterable<IWeapon, object>
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

    readonly baseAtk: number;
    readonly baseHp: number;

    readonly getAtk: ({ level }: { level: number }) => number;
    readonly getHp: ({ level }: { level: number }) => number;
}

export interface ISpell {
    readonly kind: "spell",
    readonly id: TId,
    readonly name: string,
    readonly uses: number | null | undefined
    readonly cooldown: number
    readonly effects: ISpellEffect[]
    readonly description: string;
}

export type TStat = "HP" | "ATK" | "RECEIVED_WEAPON_DAMAGE" | "RECEIVED_SPELL_DAMAGE" | "COLOR_AFFINITY";
export type TDirection = "UP" | "DOWN";
export type TStatChange = "INCREASE" | "DECREASE"

export type TStatDTO = TStat
export type TDirectionDTO = TDirection
export type TStatChangeDTO = TStatChange

export type TScaleAndBaseSpellValue = { readonly scale: number; readonly base: number };

export interface ISpellValueDTO {
    readonly unit: { readonly kind: "FIXED" } | { readonly kind: "PERCENT", readonly stat: TStatDTO }
    readonly normal: TScaleAndBaseSpellValue;
    readonly effectiveness: Record<string, TScaleAndBaseSpellValue>
};

export interface ISpellValue {
    readonly unit: { readonly kind: "FIXED" } | { readonly kind: "PERCENT", readonly stat: IStat }
    readonly normal: TScaleAndBaseSpellValue;
    readonly effectiveness: Record<string, TScaleAndBaseSpellValue>
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

export interface ISpellEffectDTO {
    readonly kind: string;
}

export interface ISpellEffect {
    readonly kind: string;
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
}

export interface IMovementEffect extends ISpellEffect {
    readonly kind: "MOVEMENT";
    readonly direction: IDirection;
    readonly count: number;
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
}

export interface IStatusEffect extends ISpellEffect {
    readonly kind: "STATUS";
    readonly effect: IStatEffect | IRepeatEffect
}

export interface IRepeatEffectDTO extends ISpellEffectDTO {
    readonly kind: "DOT";
    readonly effect: IDamageEffectDTO | IHealEffectDTO;
    readonly times: number;
    readonly interval: number;
}

export interface IRepeatEffect extends ISpellEffect {
    readonly kind: "DOT";
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
    readonly effect: IRepeatEffectDTO;
}

export interface ITileEffect extends ISpellEffect {
    readonly kind: "TILE";
    readonly effect: IRepeatEffect;
}

export interface ISummonEffectDTO extends ISpellEffectDTO {
    readonly kind: "SUMMON";
    readonly movementType: TId;
    readonly weaponType: TId;
    readonly hp: number;
    readonly atk: number;
}

export interface ISummonEffect extends ISpellEffect {
    readonly kind: "SUMMON";
    readonly movementType: IMovementType;
    readonly weaponType: IWeaponType;
    readonly hp: number;
    readonly atk: number;
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