import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValue } from "../types.ts";
import { SpellEffectValueEffectivenessItem } from "./spellEffectValueEffectivenessItem.ts";
import { SpellEffectValueFixedUnit } from "./spellEffectValueFixedUnit.ts";
import { SpellEffectValuePercentUnit } from "./spellEffectValuePercentUnit.ts";

export const SpellEffectValueSchema = defineEntity({
    name: "SpellEffectValue",
    embeddable: true,
    properties: {
        base: p.integer(),
        unit: () => p.embedded([SpellEffectValueFixedUnit, SpellEffectValuePercentUnit]).object(),
        effectiveness: () => p.embedded(SpellEffectValueEffectivenessItem).array().nullable(),
    },
});

export class SpellEffectValue extends SpellEffectValueSchema.class implements ISpellEffectValue {}
SpellEffectValueSchema.setClass(SpellEffectValue);
