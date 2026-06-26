import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, type IRepeatEffect } from "../types.ts";
import { DamageEffect } from "./damageEffect.ts";
import { HealEffect } from "./healEffect.ts";
import { SpellEffect } from "./spellEffect.ts";

export const RepeatEffectSchema = defineEntity({
    name: "RepeatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.REPEAT,
    properties: {
        kind: p.enum([ESpellEffectKind.REPEAT]),
        effect: () => p.embedded([DamageEffect, HealEffect]).object(),
        times: p.integer(),
        interval: p.integer(),
    },
});

export class RepeatEffect extends RepeatEffectSchema.class implements IRepeatEffect { }
RepeatEffectSchema.setClass(RepeatEffect);
