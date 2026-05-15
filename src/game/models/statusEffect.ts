import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IStatusEffect } from "../types.ts";
import { RepeatEffect } from "./repeatEffect.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectTargetType } from "./spellEffectTarget.ts";
import { StatEffect } from "./statEffect.ts";

export const StatusEffectSchema = defineEntity({
    name: "StatusEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "STATUS",
    properties: {
        kind: p.enum(["STATUS"]),
        effect: () => p.embedded([RepeatEffect, StatEffect]).object(),
        target: p.type(SpellEffectTargetType),
    },
});

export class StatusEffect extends StatusEffectSchema.class implements IStatusEffect {}
StatusEffectSchema.setClass(StatusEffect);
