import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, EStat, EStatChange, type IStatEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectValue } from "./spellEffectValue.ts";

export const StatEffectSchema = defineEntity({
    name: "StatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.STAT,
    properties: {
        kind: p.enum([ESpellEffectKind.STAT]),
        statChange: p.enum(() => EStatChange),
        amount: () => p.embedded(SpellEffectValue).object(),
        duration: p.integer().nullable(),
        stat: p.enum(() => EStat),
    },
});

export class StatEffect extends StatEffectSchema.class implements IStatEffect {}
StatEffectSchema.setClass(StatEffect);
