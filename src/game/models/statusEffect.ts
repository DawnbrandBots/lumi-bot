import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, ESpellEffectTarget, type IStatusEffect } from "../types.ts";
import { RepeatEffect } from "./repeatEffect.ts";
import { SpellEffect } from "./spellEffect.ts";
import { StatEffect } from "./statEffect.ts";

export const StatusEffectSchema = defineEntity({
    name: "StatusEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.STATUS,
    properties: {
        kind: p.enum([ESpellEffectKind.STATUS]),
        effect: () => p.embedded([RepeatEffect, StatEffect]).object(),
        target: p.enum(() => ESpellEffectTarget),
    },
});

export class StatusEffect extends StatusEffectSchema.class implements IStatusEffect {}
StatusEffectSchema.setClass(StatusEffect);
