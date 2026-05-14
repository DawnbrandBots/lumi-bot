import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IDamageEffect } from "../types.ts";
import { Color } from "./color.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";

export const DamageEffectSchema = defineEntity({
    name: "DamageEffect",
    embeddable: true,
    discriminatorValue: "DAMAGE",
    extends: SpellEffect,
    properties: {
        kind: p.enum(["DAMAGE"]),
        amount: () => p.embedded(SpellValue).object(),
        color: () => p.manyToOne(Color),
    },
});

export class DamageEffect extends DamageEffectSchema.class implements IDamageEffect { }
DamageEffectSchema.setClass(DamageEffect);
