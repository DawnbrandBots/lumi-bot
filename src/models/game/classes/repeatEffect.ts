import { defineEntity, p } from "@mikro-orm/core";
import type { IRepeatEffect } from "../types.ts";
import { DamageEffect } from "./damageEffect.ts";
import { HealEffect } from "./healEffect.ts";
import { SpellEffect } from "./spellEffect.ts";

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
        return `${this.effect.description} every ${this.interval} seconds, ${this.times} times`
    }
}
RepeatEffectSchema.setClass(RepeatEffect);
