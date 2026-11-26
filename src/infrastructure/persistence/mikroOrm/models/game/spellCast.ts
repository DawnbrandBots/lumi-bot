import { defineEntity, p } from "@mikro-orm/sqlite";
import {
    ESpellCastKind,
    type ISpellCastProperties,
    type TSpellCast,
} from "../../../../../domain/game/models/spell.types.ts";
import spellDraggingMode from "../../../../../domain/game/rules/spellDraggingMode.ts";
import { DamageEffect } from "./damageEffect.ts";
import { HealEffect } from "./healEffect.ts";
import { MovementEffect } from "./movementEffect.ts";
import { ObstacleEffect } from "./obstacleEffect.ts";
import { SpellShape } from "./spellShape.ts";
import { StatusEffect } from "./statusEffect.ts";
import { SummonEffect } from "./summonEffect.ts";
import { TileEffect } from "./tileEffect.ts";
import { WarpEffect } from "./warpEffect.ts";

const castProperties = {
    cooldown: p.integer(),
    countdown: p.integer().nullable(),
    shape: () => p.manyToOne(SpellShape),
    effects: () =>
        p
            .embedded([
                DamageEffect,
                HealEffect,
                WarpEffect,
                MovementEffect,
                TileEffect,
                ObstacleEffect,
                SummonEffect,
                StatusEffect,
            ])
            .array(),
};

const SpellCastPropertiesSchema = defineEntity({
    name: "SpellCastProperties",
    embeddable: true,
    properties: castProperties,
});

class SpellCastProperties extends SpellCastPropertiesSchema.class implements ISpellCastProperties {
    get draggingMode() {
        return spellDraggingMode(this.effects);
    }
}
SpellCastPropertiesSchema.setClass(SpellCastProperties);

const SpellCastSchema = defineEntity({
    name: "SpellCast",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        kind: p.enum(() => ESpellCastKind),
    },
});

abstract class SpellCast extends SpellCastSchema.class {}
SpellCastSchema.setClass(SpellCast);

const NormalSpellCastSchema = defineEntity({
    name: "NormalSpellCast",
    embeddable: true,
    extends: SpellCast,
    discriminatorValue: ESpellCastKind.NORMAL,
    properties: {
        kind: p.enum(() => ESpellCastKind).$type<typeof ESpellCastKind.NORMAL>(),
        ...castProperties,
    },
});

export class NormalSpellCast extends NormalSpellCastSchema.class implements ISpellCastProperties {
    get draggingMode() {
        return spellDraggingMode(this.effects);
    }
}
NormalSpellCastSchema.setClass(NormalSpellCast);

const FormBasedSpellCastSchema = defineEntity({
    name: "FormBasedSpellCast",
    embeddable: true,
    extends: SpellCast,
    discriminatorValue: ESpellCastKind.FORM_BASED,
    properties: {
        kind: p.enum(() => ESpellCastKind).$type<typeof ESpellCastKind.FORM_BASED>(),
        light: () => p.embedded(SpellCastProperties),
        shadow: () => p.embedded(SpellCastProperties),
    },
});

export class FormBasedSpellCast
    extends FormBasedSpellCastSchema.class
    implements Extract<TSpellCast, { kind: typeof ESpellCastKind.FORM_BASED }> {}
FormBasedSpellCastSchema.setClass(FormBasedSpellCast);
