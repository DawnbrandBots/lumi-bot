import { defineEntity, p, Type } from '@mikro-orm/core';
import { DISCIPLE_BASE_ATK, DISCIPLE_BASE_HP, WEAPON_VARIANTS_BONUSES } from './constants.ts';
import type { IColor, IDamageEffect, IDirection, IDisciple, IHealEffect, IIceBlockEffect, IMovementEffect, IMovementType, IRepeatEffect, ISpell, ISpellDraggingMode, ISpellEffect, ISpellEffectTarget, ISpellRole, ISpellShape, ISpellValue, ISpellValueEffectivenessItem, ISpellValueFixedUnit, ISpellValuePercentUnit, ISpellValueUnit, IStat, IStatChange, IStatEffect, IStatusEffect, ISummonEffect, ITileEffect, IWarpEffect, IWeapon, IWeaponSkill, IWeaponSkillEffect, IWeaponType, TSpellDraggingMode, TSpellEffectTarget, TSpellRole } from './types.ts';

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
        uniqueSkill: () => p.manyToOne(WeaponSkill).inversedBy("weapons"),
        prfDisciple: () => p.oneToOne(Disciple).mappedBy("prfWeapon")
    },
});

export class Weapon extends WeaponSchema.class implements IWeapon {
    get kind() { return "weapon" as const }

    public getWeaponVariantStat({ stat, variant }: { variant: 'HP' | 'NEUTRAL' | 'ATK'; stat: 'hp' | 'atk'; }): number {
        return this.level === 1 ? 0 : this[stat] + WEAPON_VARIANTS_BONUSES[variant][stat]
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
        prfWeapon: () => p.oneToOne(Weapon).inversedBy("prfDisciple").owner(),
        spells: () => p.oneToMany(Spell).mappedBy("disciple")
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

    public getHp({ level }: { level: number; }): number {
        return Math.floor(this.baseHp * (1 + 0.1 * (level - 1)))
    }

    public getAtk({ level }: { level: number; }): number {
        return Math.floor(this.baseAtk * (1 + 0.1 * (level - 1)))
    }
}
DiscipleSchema.setClass(Disciple);

export class SpellEffectTarget implements ISpellEffectTarget {
    readonly kind: ISpellEffectTarget["kind"];
    readonly asString: ISpellEffectTarget["asString"];

    public constructor({ kind, asString }: {
        readonly kind: ISpellEffectTarget["kind"],
        readonly asString: ISpellEffectTarget["asString"],
    }) {
        this.kind = kind
        this.asString = asString
    }
}

const SPELL_EFFECT_TARGETS = {
    ANY: new SpellEffectTarget({ kind: "ANY", "asString": "targets" }),
    SELF: new SpellEffectTarget({ kind: "SELF", "asString": "user", }),
    DUAL: new SpellEffectTarget({ kind: "DUAL", "asString": "user and targets", }),
} as const satisfies { [K in TSpellEffectTarget]: ISpellEffectTarget }

export class SpellEffectTargetType extends Type<SpellEffectTarget, string | null | undefined> {
    public convertToDatabaseValue(value: SpellEffectTarget | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellEffectTarget {
        if (value in SPELL_EFFECT_TARGETS) {
            return SPELL_EFFECT_TARGETS[value as keyof typeof SPELL_EFFECT_TARGETS]
        }
        throw new Error("Invalid spell effect target id")
    }
}

export class SpellRole implements ISpellRole {
    readonly kind: ISpellRole["kind"];
    readonly name: ISpellRole["name"];

    public constructor({ kind, name }: {
        readonly kind: ISpellRole["kind"],
        readonly name: ISpellRole["name"],
    }) {
        this.kind = kind
        this.name = name
    }
}

const SPELL_EFFECT_ROLES = {
    EX: new SpellRole({ kind: "EX", "name": "EX" }),
    LIGHT: new SpellRole({ kind: "LIGHT", "name": "Light", }),
    SHADOW: new SpellRole({ kind: "SHADOW", "name": "Shadow", }),
} as const satisfies { [K in TSpellRole]: ISpellRole }

export class SpellRoleType extends Type<SpellRole, string | null | undefined> {
    public convertToDatabaseValue(value: SpellRole | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellRole {
        if (value in SPELL_EFFECT_ROLES) {
            return SPELL_EFFECT_ROLES[value as keyof typeof SPELL_EFFECT_ROLES]
        }
        throw new Error("Invalid spell effect target id")
    }
}

export const SpellShapeSchema = defineEntity({
    name: "SpellShape",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        tiles: p.string().length(25)
    }
})
export abstract class SpellShape extends SpellShapeSchema.class implements ISpellShape { }
SpellShapeSchema.setClass(SpellShape)

export const SpellEffectSchema = defineEntity({
    name: 'SpellEffect',
    embeddable: true,
    discriminatorColumn: 'kind',
    abstract: true,
    properties: {
        kind: p.string(),
        // TODO: it does not make sense for nested effects (STAT, REPEAT and DAMAGE or HEALING when nested) to have a target property
        target: p.type(SpellEffectTargetType).nullable()
    },
})
export abstract class SpellEffect extends SpellEffectSchema.class implements ISpellEffect {
    public abstract readonly description: ISpellEffect["description"];
}
SpellEffectSchema.setClass(SpellEffect)

export class SpellDraggingMode implements ISpellDraggingMode {
    readonly kind: ISpellDraggingMode["kind"];
    readonly asString: ISpellDraggingMode["asString"];

    public constructor({ kind, asString }: {
        readonly kind: ISpellDraggingMode["kind"],
        readonly asString: ISpellDraggingMode["asString"],
    }) {
        this.kind = kind
        this.asString = asString
    }
}

const SPELL_DRAGGING_MODE = {
    ANY: new SpellDraggingMode({ kind: "ANY", "asString": "Any tile" }),
    SELF: new SpellDraggingMode({ kind: "SELF", "asString": "User tile only", }),
} as const satisfies { [K in TSpellDraggingMode]: ISpellDraggingMode }

export class SpellDraggingModeType extends Type<SpellDraggingMode, string | null | undefined> {
    public convertToDatabaseValue(value: SpellDraggingMode | null | undefined): string | null | undefined {
        return value?.kind;
    }

    public convertToJSValue(value: string): SpellDraggingMode {
        if (value in SPELL_DRAGGING_MODE) {
            return SPELL_DRAGGING_MODE[value as keyof typeof SPELL_DRAGGING_MODE]
        }
        throw new Error("Invalid spell effect target id")
    }
}

export const SpellSchema = defineEntity({
    name: 'Spell',
    properties: {
        id: p.string().primary(),
        name: p.string(),
        disciple: () => p.manyToOne(Disciple).inversedBy("spells"),
        role: p.type(SpellRoleType),
        shape: p.manyToOne(SpellShape),
        uses: p.integer().nullable(),
        cooldown: p.integer(),
        effects: () => p.embedded([DamageEffect, HealEffect, WarpEffect, MovementEffect, TileEffect, IceBlockEffect, SummonEffect, StatusEffect]).array(),
        // TODO: onlyFor will get a proper type in a later update. Right now it has the same issues as TileEffect when using polymorphic relationships
        // as type for the "which" nested property, which can reference either MovementType or WeaponType
        onlyFor: p.json<{ kind: string, which: string }>().nullable()
    },
})

export class Spell extends SpellSchema.class implements ISpell {
    get kind() { return "spell" as const }

    get draggingMode() {
        // TODO: target being nullable is due to some spell effects being wrongly typed:
        // damage and healing effects can be nested, in which case they don't have a target,
        // but they always have a target at the root as effects at the rool level of Spell.effects
        // This needs to be fixed eventually!!
        return this.effects.every(effect => effect.target!.kind === "SELF") ? SPELL_DRAGGING_MODE.SELF : SPELL_DRAGGING_MODE.ANY
    }
}
SpellSchema.setClass(Spell);

export const DirectionSchema = defineEntity({
    name: 'Direction',
    properties: {
        id: p.string().primary(),
        noun: p.string()
    },
})

export class Direction extends DirectionSchema.class implements IDirection {
}
DirectionSchema.setClass(Direction);

export const StatChangeSchema = defineEntity({
    name: 'StatChange',
    properties: {
        id: p.string().primary(),
        verb: p.string()
    },
})

export class StatChange extends StatChangeSchema.class implements IStatChange {
}
StatChangeSchema.setClass(StatChange);

export const SpellValueUnitSchema = defineEntity({
    name: 'SpellValueUnit',
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        // TODO: do the same for other abstract classes kinds?
        kind: p.enum(["FIXED", "PERCENT"])
    },
})
export abstract class SpellValueUnit extends SpellValueUnitSchema.class implements ISpellValueUnit {
    public abstract format({ base }: { base: number }): string;
}
SpellValueUnitSchema.setClass(SpellValueUnit);

export const SpellValueFixedUnitSchema = defineEntity({
    name: 'SpellValueFixedUnit',
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: "FIXED",
    properties: {
        kind: p.enum(["FIXED"])
    },
})
export class SpellValueFixedUnit extends SpellValueFixedUnitSchema.class implements ISpellValueFixedUnit {
    // TODO: fix type here :|
    // @ts-ignore
    public format({ base }) {
        return base.toString()
    }
}
SpellValueFixedUnitSchema.setClass(SpellValueFixedUnit);

export const SpellValuePercentUnitSchema = defineEntity({
    name: 'SpellValuePercentUnit',
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: "PERCENT",
    properties: {
        kind: p.enum(["PERCENT"]),
        stat: () => p.manyToOne(Stat)
    },
})
export class SpellValuePercentUnit extends SpellValuePercentUnitSchema.class implements ISpellValuePercentUnit {
    // TODO: fix type here :|
    // @ts-ignore
    public format({ base }) {
        return `(${base}% of ${this.stat.name})`
    }
}
SpellValuePercentUnitSchema.setClass(SpellValuePercentUnit);

// TODO: need to add some check that classes are assigned to the right schemas
// some combinations are not incompatible and not reported by TypeScript,
// namely when assigning an extending class
// to an extended schema, and this causes errors during discovery

export const SpellValueEffectivenessItemSchema = defineEntity({
    name: "SpellValueEffectivenessItem",
    embeddable: true,
    properties: {
        kind: p.string(),
        base: p.integer()
    }
})
export class SpellValueEffectivenessItem extends SpellValueEffectivenessItemSchema.class implements ISpellValueEffectivenessItem { }
SpellValueEffectivenessItemSchema.setClass(SpellValueEffectivenessItem);

export const SpellValueSchema = defineEntity({
    name: 'SpellValue',
    embeddable: true,
    properties: {
        base: p.integer(),
        unit: () => p.embedded([SpellValueFixedUnit, SpellValuePercentUnit]).object(),
        effectiveness: () => p.embedded(SpellValueEffectivenessItem).array().nullable()
    },
})

export class SpellValue extends SpellValueSchema.class implements ISpellValue { }
SpellValueSchema.setClass(SpellValue);

export const StatSchema = defineEntity({
    name: 'Stat',
    properties: {
        id: p.string().primary(),
        name: p.string()
    },
})

export class Stat extends StatSchema.class implements IStat {
}
StatSchema.setClass(Stat);

// TODO: with the current class definitions for spell effects,
// "kind" will be a property of instances instead of being inherited from the prototype.
// Look for a way to move kind back to the prototype while
// keeping the discriminator working and remaining type-safe.

export const DamageEffectSchema = defineEntity({
    name: 'DamageEffect',
    embeddable: true,
    discriminatorValue: "DAMAGE",
    extends: SpellEffect,
    properties: {
        kind: p.enum(["DAMAGE"]),
        amount: () => p.embedded(SpellValue).object(),
        color: () => p.manyToOne(Color)
    },
})

export class DamageEffect extends DamageEffectSchema.class implements IDamageEffect {

    public get description() {
        const targetStr = this.target ? ` to ${this.target.asString}` : ""
        let str = `Deals ${this.amount.unit.format({ base: this.amount.base })} ${this.color.name} damage${targetStr}`
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} against ${kind} units`).join(", ")})`
            str += " " + effectivenessString
        }
        str += "."
        return str
    }
}
DamageEffectSchema.setClass(DamageEffect);

export const HealEffectSchema = defineEntity({
    name: 'HealEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "HEAL",
    properties: {
        kind: p.enum(["HEAL"]),
        amount: () => p.embedded(SpellValue).object()
    },
})

export class HealEffect extends HealEffectSchema.class implements IHealEffect {

    public get description() {
        const targetStr = this.target ? ` to ${this.target.asString}` : ""
        let str = `Restores ${this.amount.unit.format({ base: this.amount.base })} HP${targetStr}`
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} for ${kind} units`).join(", ")})`
            str += " " + effectivenessString
        }
        str += "."
        return str
    }
}
HealEffectSchema.setClass(HealEffect);

export const MovementEffectSchema = defineEntity({
    name: 'MovementEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "MOVEMENT",
    properties: {
        kind: p.enum(["MOVEMENT"]),
        direction: () => p.manyToOne(Direction),
        count: p.integer(),
        target: p.type(SpellEffectTargetType)
    },
})

export class MovementEffect extends MovementEffectSchema.class implements IMovementEffect {

    public get description() {
        return `Moves ${this.target.asString} ${this.count} tile${this.count > 1 ? "s" : ""} ${this.direction.noun}.`
    }
}
MovementEffectSchema.setClass(MovementEffect);

export const StatEffectSchema = defineEntity({
    name: 'StatEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "STAT",
    properties: {
        kind: p.enum(["STAT"]),
        statChange: () => p.manyToOne(StatChange),
        amount: () => p.embedded(SpellValue).object(),
        duration: p.integer().nullable(),
        stat: () => p.manyToOne(Stat)
    },
})

export class StatEffect extends StatEffectSchema.class implements IStatEffect {

    public get description() {
        // TODO: feels like call to format could be simplified...
        // TODO: string should be simplified when unit stat is same as target stat...
        // TODO: COLOR_AFFINITY_BOOST's base values are unusual compared to other stats and do not render nicely (eg. 16.66666666...),
        // consider formatting otherwise or changing how values are expressed
        let str = `${this.statChange.verb} ${this.stat.name} by ${this.amount.unit.format({ base: this.amount.base })}`
        // TODO: this pattern is also repeated in damageeffect, healeffect
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} for ${kind} units`).join(", ")})`
            str += " " + effectivenessString
        }
        str += "."
        return str
    }
}
StatEffectSchema.setClass(StatEffect);

export const StatusEffectSchema = defineEntity({
    name: 'StatusEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "STATUS",
    properties: {
        kind: p.enum(["STATUS"]),
        effect: () => p.embedded([RepeatEffect, StatEffect]).object(),
        target: p.type(SpellEffectTargetType)
    },
})

export class StatusEffect extends StatusEffectSchema.class implements IStatusEffect {

    public get description() {
        // TODO: how should punctuation be handled when description getters call other description getters?
        return `Grants ${this.target.asString} status: ${this.effect.description}`
    }
}
StatusEffectSchema.setClass(StatusEffect);

export const RepeatEffectSchema = defineEntity({
    name: 'RepeatEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "REPEAT",
    properties: {
        kind: p.enum(["REPEAT"]),
        effect: () => p.embedded([DamageEffect, HealEffect]).object(),
        times: p.integer(),
        interval: p.integer()
    },
})

export class RepeatEffect extends RepeatEffectSchema.class implements IRepeatEffect {

    public get description() {
        return `Every ${this.interval} seconds, ${this.times} times: ${this.effect.description}`
    }
}
RepeatEffectSchema.setClass(RepeatEffect);

export const WarpEffectSchema = defineEntity({
    name: 'WarpEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "WARP",
    properties: {
        kind: p.enum(["WARP"]),
    },
})

export class WarpEffect extends WarpEffectSchema.class implements IWarpEffect {

    public get description() {
        return `Moves user to target tile.`
    }
}
WarpEffectSchema.setClass(WarpEffect);

export const IceBlockEffectSchema = defineEntity({
    name: 'IceBlockEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "ICE_BLOCK",
    properties: {
        kind: p.enum(["ICE_BLOCK"]),
        hp: p.integer()
    },
})

export class IceBlockEffect extends IceBlockEffectSchema.class implements IIceBlockEffect {

    public get description() {
        return `Summons ice blocks with ${this.hp} HP.`
    }
}
IceBlockEffectSchema.setClass(IceBlockEffect);

export const TileEffectSchema = defineEntity({
    name: 'TileEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "TILE",
    properties: {
        kind: p.enum(["TILE"]),
        // TODO: "repeat" was originally called effect, and I wish it remained so.
        // However, a crash occurs during MikroORM's schema discovery
        // when the property is named "effect".
        // The bug seems to occur because TileEffect is listed as a possible
        // type for Spell.effects alongside StatusEffect, which also has an effect property.
        // Removing either TileEffect or StatusEffect from Spell.effects removes the crash
        // but prevents either spell effect schema's class from being used at runtime.
        // I'll try to make a minimum repro later.
        // I also looked into workarounds, like renaming "effect" into something else and making it a hidden property,
        // adding a getter named "effect" to access the hidden property, and using serializedName/fieldName
        // to assign the value from the JSON's "effect" to the now renamed hidden property.
        // However, serializedName/fieldName don't appear to work that way. Maybe that can make for a feature request?
        repeat: () => p.embedded(RepeatEffect).object()
    },
})

export class TileEffect extends TileEffectSchema.class implements ITileEffect {
    public get description() {
        // TODO: but not urgent: using the target property in TileEffect's description 
        return `Grants effect to target tiles: ${this.repeat.description}`
    }
}
TileEffectSchema.setClass(TileEffect);

export const SummonEffectStatSchema = defineEntity({
    name: "SummonEffectStat",
    embeddable: true,
    properties: {
        base: p.integer(),
        scale: p.integer().nullable()
    }
})
export class SummonEffectStat extends SummonEffectStatSchema.class { }
SummonEffectStatSchema.setClass(SummonEffectStat)

export const SummonEffectSchema = defineEntity({
    name: 'SummonEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "SUMMON",
    properties: {
        kind: p.enum(["SUMMON"]),
        movementType: () => p.manyToOne(MovementType),
        weaponType: () => p.manyToOne(WeaponType),
        hp: () => p.embedded(SummonEffectStat).object(),
        atk: () => p.embedded(SummonEffectStat).object()
    },
})

export class SummonEffect extends SummonEffectSchema.class implements ISummonEffect {

    public get description() {
        // TODO: technically should use HP and Atk entities names, but that's something more advanced to handle later...
        return `Summons ${this.weaponType.name} ${this.movementType.name} minion with ${this.hp.base} HP and ${this.atk.base} Atk.`
    }
}
SummonEffectSchema.setClass(SummonEffect);
