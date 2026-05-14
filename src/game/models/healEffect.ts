import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IHealEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";

export const HealEffectSchema = defineEntity({
    name: "HealEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "HEAL",
    properties: {
        kind: p.enum(["HEAL"]),
        amount: () => p.embedded(SpellValue).object(),
    },
});

export class HealEffect extends HealEffectSchema.class implements IHealEffect { }
HealEffectSchema.setClass(HealEffect);
