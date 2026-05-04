import { defineEntity, p, Platform, Type } from '@mikro-orm/core';
import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP } from './constants.ts';
import type { IColor, IDamageEffect, IDisciple, IHealEffect, IIceBlockEffect, IMovementEffect, IMovementType, IRepeatEffect, ISpell, ISpellEffect, ISpellValue, IStat, IStatEffect, IStatusEffect, ISummonEffect, ITileEffect, IWarpEffect, IWeapon, IWeaponSkill, IWeaponSkillEffect, IWeaponType } from './types.ts';

export const ColorSchema = defineEntity({
    name: 'Color',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        strongAgainst: () => p.oneToOne(Color).nullable(),
        weakAgainst: () => p.oneToOne(Color).nullable()
    },
})

export class Color extends ColorSchema.class implements IColor {
    get kind() { return "color" as const }

}
ColorSchema.setClass(Color);

export const WeaponTypeSchema = defineEntity({
    name: 'WeaponType',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        color: () => p.manyToOne(Color),
        range: p.integer(),
    },
})

export class WeaponType extends WeaponTypeSchema.class implements IWeaponType {
    get kind() { return "weaponType" as const }

    get description(): string {
        return `${this.name} is a ${this.range}-ranged ${this.color.name} weapon type.`
    }

    get discipleBaseAtkModifier(): number {
        return this.range === 1 ? 1 : 2 / 3;
    }
}
WeaponTypeSchema.setClass(WeaponType);

export const MovementTypeSchema = defineEntity({
    name: 'MovementType',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        distance: p.integer(),
        canTraverseWaterTiles: p.boolean(),
        discipleBaseHpModifier: p.integer(),
        discipleBaseAtkModifier: p.integer(),
    },
})

export class MovementType extends MovementTypeSchema.class implements IMovementType {
    get kind() { return "movement" as const }
}
MovementTypeSchema.setClass(MovementType);

export const WeaponSkillEffectSchema = defineEntity({
    name: 'WeaponSkillEffect',
    properties: {
        id: p.string().primary(),
        description: p.string()
    },
});

export class WeaponSkillEffect extends WeaponSkillEffectSchema.class implements IWeaponSkillEffect {
    get kind() { return "weaponSkillEffect" as const }
}
WeaponSkillEffectSchema.setClass(WeaponSkillEffect);

export const WeaponSkillSchema = defineEntity({
    name: 'WeaponSkill',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        effect: () => p.manyToOne(WeaponSkillEffect),
        weapons: () => p.oneToMany(Weapon).mappedBy("uniqueSkill")
    },
});

export class WeaponSkill extends WeaponSkillSchema.class implements IWeaponSkill {
    get kind() { return "weaponSkill" as const }

    get description(): string {
        return this.effect.description
    }
}
WeaponSkillSchema.setClass(WeaponSkill);

export const WeaponSchema = defineEntity({
    name: 'Weapon',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        weaponType: () => p.manyToOne(WeaponType),
        level: p.integer(),
        hp: p.integer(),
        atk: p.integer(),
        freeSkillSlots: p.integer(),
        uniqueSkill: () => p.manyToOne(WeaponSkill).inversedBy("weapons").owner(),
    },
});

export class Weapon extends WeaponSchema.class implements IWeapon {
    get kind() { return "weapon" as const }

    get description(): string {
        return `${this.name} is a level ${this.level} ${this.weaponType.name}`
    }
}
WeaponSchema.setClass(Weapon);

export const DiscipleSchema = defineEntity({
    name: 'Disciple',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        prfWeapon: () => p.manyToOne(Weapon),
    },
})

export class Disciple extends DiscipleSchema.class implements IDisciple {
    public get kind() { return "disciple" as const }

    public get baseHp() {
        return Math.floor(DISCIPLE_BASE_HP * this.movementType.discipleBaseHpModifier)
    }

    public get baseAtk() {
        return Math.floor(DISCIPLE_BASE_ATK * this.movementType.discipleBaseAtkModifier * this.weaponType.discipleBaseAtkModifier)
    }

    // TODO: disciple level?
    public getHp({ level }: { level: number; }): number {
        return Math.floor(this.baseHp * (1 + 0.1 * (level - 1)))
    }

    public getAtk({ level }: { level: number; }): number {
        return Math.floor(this.baseAtk * (1 + 0.1 * (level - 1)))
    }
}
DiscipleSchema.setClass(Disciple);

export class SpellValue implements ISpellValue {
    readonly unit: ISpellValue["unit"]
    readonly normal: ISpellValue["normal"]
    readonly effectiveness: ISpellValue["effectiveness"]

    constructor(data: ISpellValue) {
        this.unit = data.unit
        this.normal = data.normal
        this.effectiveness = data.effectiveness
    }
}

// TODO: naming? since it's not a db type
// TODO: JSON object or string from db? (second type)
export class SpellEffects extends Type<ISpellEffect[], string> {
    public convertToDatabaseValue(value: ISpellEffect[] | null | undefined, platform: Platform): string {
        return "[]"
        // throw new Error("Not supposed to happen, not handled")
    }

    // Note: null values from the database are handled by the ORM and won't reach this method
    public convertToJSValue(value: string, platform: Platform): ISpellEffect[] {
        // // TODO: unchecked, this assumes that the DB's content was validated beforehand.
        // // const json: TSpellEffectDTO[] = JSON.parse(value)

        // TODO: TO BE IMPLEMENTED

        return []

        // return json.map(effectDto => {
        //     const kind = effectDto.kind
        //     switch (kind) {
        //         case "DAMAGE":
        //             return new DamageEffect({
        //                 ...effectDto,
        //                 color: "uh"
        //             });
        //         case "HEAL":
        //             const a = effectDto.amount.unit.kind === "PERCENT" ? {
        //                 kind: "PERCENT",
        //                 stat: getStatFromId(effectDto.amount.unit.stat)
        //             } : { kind: "FIXED" }
        //             return new HealEffect({
        //                 ...effectDto,
        //                 amount: new SpellValue({ ...effectDto.amount, unit: a })
        //             });
        //         case "MOVEMENT":
        //             return new MovementEffect({
        //                 ...effectDto,
        //                 direction: getDirectionFromId(effectDto.direction)
        //             });
        //         case "STAT":
        //             // Distinguish between StatEffect and StatusEffect by checking for statChange property
        //             return new StatEffect(effectDto);
        //         case "STATUS":
        //             // Distinguish between StatEffect and StatusEffect by checking for statChange property
        //             return new StatusEffect(effectDto);
        //         case "DOT":
        //             return new RepeatEffect(effectDto);
        //         case "WARP":
        //             return new WarpEffect();
        //         case "ICE_BLOCK":
        //             return new IceBlockEffect(effectDto);
        //         case "TILE":
        //             return new TileEffect(effectDto);
        //         case "SUMMON":
        //             return new SummonEffect(effectDto);
        //         default:
        //             throw new Error(`Unknown effect kind: ${kind}`);
        //     }
        // })
    }
}

export const SpellSchema = defineEntity({
    name: 'Spell',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple),
        role: p.string(),
        shape: p.string(),
        uses: p.integer().nullable(),
        cooldown: p.integer(),
        effects: p.json().type(SpellEffects).$type<ISpellEffect[]>()
    },
})

export class Spell extends SpellSchema.class implements ISpell {
    get kind() { return "spell" as const }

    // TODO: incomplete description
    get description() { return this.effects.map(effect => `- ${effect.description}`).join("\n") }
}
SpellSchema.setClass(Spell);

export class Stat implements IStat {
    readonly id: string;
    readonly name: string;

    constructor(data: {
        readonly id: string;
        readonly name: string;
    }) {
        this.id = data.id
        this.name = data.name
    }
}

// Type helper to extract SpellEffect properties excluding ISpellEffect base properties
type SpellEffectCtorArg<T extends ISpellEffect> = Omit<T, keyof ISpellEffect>;

// Regular classes for spell effects
export class DamageEffect implements IDamageEffect {
    public get kind() { return "DAMAGE" as const; }
    readonly amount: IDamageEffect["amount"];
    readonly color: IDamageEffect["color"];

    constructor(data: SpellEffectCtorArg<IDamageEffect>) {
        this.amount = data.amount;
        this.color = data.color;
    }

    public get description() {
        // TODO: string for effectiveness should be handled more properly
        const damageAmountString = this.amount.unit.kind === "FIXED" ? `${this.amount.normal.base} ${this.color.name}` : `${this.amount.normal.base}% of ${this.amount.unit.stat.name} as`
        let str = `Deals ${damageAmountString} damage to targets`
        const effectivenessEntries = Object.entries(this.amount.effectiveness)
        if (effectivenessEntries.length) {
            const effectivenessString = `(${effectivenessEntries.map(([key, { base }]) => `${base} against ${key} units.`).join(", ")})`
            str += " " + effectivenessString
        }
        str += "."
        return str
    }
}

export class HealEffect implements IHealEffect {
    public get kind() { return "HEAL" as const; }
    readonly amount: IHealEffect["amount"];

    constructor(data: SpellEffectCtorArg<IHealEffect>) {
        this.amount = data.amount;
    }

    public get description() {
        const healAmountString = this.amount.unit.kind === "FIXED" ? this.amount.normal.base : `${this.amount.normal.base}% of ${this.amount.unit.stat.name} as`
        let str = `Heals ${healAmountString} HP to targets`
        const effectivenessEntries = Object.entries(this.amount.effectiveness)
        if (effectivenessEntries.length) {
            const effectivenessString = `(${effectivenessEntries.map(([key, { base }]) => `${base} for ${key} units.`).join(", ")})`
            str += " " + effectivenessString
        }
        str += "."
        return str
    }
}

export class MovementEffect implements IMovementEffect {
    public get kind() { return "MOVEMENT" as const; }
    // TODO: direction should probably get its own class
    readonly direction: IMovementEffect["direction"];
    readonly count: IMovementEffect["count"];

    constructor(data: SpellEffectCtorArg<IMovementEffect>) {
        this.direction = data.direction;
        this.count = data.count;
    }

    public get description() {
        return `Swaps position of target and units ${this.count} tile${this.count > 1 ? "s" : ""} ${this.direction.noun}.`
    }
}

export class StatEffect implements IStatEffect {
    public get kind() { return "STAT" as const; }
    readonly statChange: IStatEffect["statChange"];
    readonly amount: IStatEffect["amount"];
    readonly duration: IStatEffect["duration"];
    readonly stat: IStatEffect["stat"]

    constructor(data: SpellEffectCtorArg<IStatEffect>) {
        this.statChange = data.statChange;
        this.amount = data.amount;
        this.duration = data.duration;
        this.stat = data.stat;
    }

    public get description() {
        // TODO: not DONE :(
        return `${this.statChange.verb} ${this.stat.name} by.`
    }
}

export class StatusEffect implements IStatusEffect {
    public get kind() { return "STATUS" as const; }
    readonly effect: IStatusEffect["effect"]

    constructor(data: SpellEffectCtorArg<IStatusEffect>) {
        this.effect = data.effect;
    }

    public get description() {
        // TODO: trailing dot?
        return `Grants status effect: ${this.effect.description}`
    }
}

export class RepeatEffect implements IRepeatEffect {
    public get kind() { return "DOT" as const; }
    readonly effect: IRepeatEffect["effect"];
    readonly times: IRepeatEffect["times"];
    readonly interval: IRepeatEffect["interval"];

    constructor(data: SpellEffectCtorArg<IRepeatEffect>) {
        this.effect = data.effect;
        this.times = data.times;
        this.interval = data.interval;
    }

    public get description() {
        // TODO: trailing dot?
        return `Every ${this.interval} seconds, ${this.times} times: ${this.effect.description}`
    }
}

export class WarpEffect implements IWarpEffect {
    public get kind() { return "WARP" as const; }

    public get description() {
        return `Moves disciple to target tile.`
    }
}

export class IceBlockEffect implements IIceBlockEffect {
    public get kind() { return "ICE_BLOCK" as const; }
    readonly hp: IIceBlockEffect["hp"];

    constructor(data: SpellEffectCtorArg<IIceBlockEffect>) {
        this.hp = data.hp;
    }

    public get description() {
        return `Summons ice blocks with ${this.hp} HP.`
    }
}

export class TileEffect implements ITileEffect {
    public get kind() { return "TILE" as const; }
    readonly effect: ITileEffect["effect"];

    constructor(data: SpellEffectCtorArg<ITileEffect>) {
        this.effect = data.effect;
    }

    public get description() {
        // TODO: trailing dot?
        return `Grants effect to target tiles: ${this.effect.description}`
    }
}

export class SummonEffect implements ISummonEffect {
    public get kind() { return "SUMMON" as const; }
    readonly movementType: ISummonEffect["movementType"];
    readonly weaponType: ISummonEffect["weaponType"];
    readonly hp: ISummonEffect["hp"];
    readonly atk: ISummonEffect["atk"];

    constructor(data: SpellEffectCtorArg<ISummonEffect>) {
        this.movementType = data.movementType;
        this.weaponType = data.weaponType;
        this.hp = data.hp;
        this.atk = data.atk;
    }

    public get description() {
        return `Summons ${this.weaponType.name}-wielding ${this.movementType} minion with ${this.hp} HP and ${this.atk} Atk.`
    }
}
