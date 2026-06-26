import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, type IHealEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectValue } from "./spellEffectValue.ts";

export const HealEffectSchema = defineEntity({
    name: "HealEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.HEAL,
    properties: {
        kind: p.enum([ESpellEffectKind.HEAL]),
        amount: () => p.embedded(SpellEffectValue).object(),
    },
});

export class HealEffect extends HealEffectSchema.class implements IHealEffect { }
HealEffectSchema.setClass(HealEffect);
