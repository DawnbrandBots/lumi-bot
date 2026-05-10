import { defineEntity, p } from "@mikro-orm/core";
import type { IStatusEffect } from "../types.ts";
import { RepeatEffect } from "./repeatEffect.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectTargetType } from "./spellEffectTarget.ts";
import { StatEffect } from "./statEffect.ts";

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
