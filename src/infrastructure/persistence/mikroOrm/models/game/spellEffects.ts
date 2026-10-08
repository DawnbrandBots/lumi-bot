import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IFormBasedSpellEffects, INormalSpellEffects } from "../../../../../domain/game/models/spell.types.ts";
import { ESpellEffectsKind } from "../../../../../domain/game/models/spell.types.ts";
import { DamageEffect } from "./damageEffect.ts";
import { HealEffect } from "./healEffect.ts";
import { MovementEffect } from "./movementEffect.ts";
import { ObstacleEffect } from "./obstacleEffect.ts";
import { StatusEffect } from "./statusEffect.ts";
import { SummonEffect } from "./summonEffect.ts";
import { TileEffect } from "./tileEffect.ts";
import { WarpEffect } from "./warpEffect.ts";

const ROOT_EFFECT_TYPES = [
    DamageEffect,
    HealEffect,
    WarpEffect,
    MovementEffect,
    TileEffect,
    ObstacleEffect,
    SummonEffect,
    StatusEffect,
];

export const SpellEffectsSchema = defineEntity({
    name: "SpellEffects",
    embeddable: true,
    discriminatorColumn: "kind",
    abstract: true,
    properties: {
        kind: p.enum(() => ESpellEffectsKind),
    },
});
export abstract class SpellEffects extends SpellEffectsSchema.class {}
SpellEffectsSchema.setClass(SpellEffects);

export const NormalSpellEffectsSchema = defineEntity({
    name: "NormalSpellEffects",
    embeddable: true,
    extends: SpellEffects,
    discriminatorValue: ESpellEffectsKind.NORMAL,
    properties: {
        kind: p.enum([ESpellEffectsKind.NORMAL]),
        effects: () => p.embedded(ROOT_EFFECT_TYPES).array(),
    },
});
export class NormalSpellEffects extends NormalSpellEffectsSchema.class implements INormalSpellEffects {}
NormalSpellEffectsSchema.setClass(NormalSpellEffects);

export const FormBasedSpellEffectsSchema = defineEntity({
    name: "FormBasedSpellEffects",
    embeddable: true,
    extends: SpellEffects,
    discriminatorValue: ESpellEffectsKind.FORM_BASED,
    properties: {
        kind: p.enum([ESpellEffectsKind.FORM_BASED]),
        light: () => p.embedded(ROOT_EFFECT_TYPES).array(),
        shadow: () => p.embedded(ROOT_EFFECT_TYPES).array(),
    },
});
export class FormBasedSpellEffects extends FormBasedSpellEffectsSchema.class implements IFormBasedSpellEffects {}
FormBasedSpellEffectsSchema.setClass(FormBasedSpellEffects);
