import { defineEntity, p } from "@mikro-orm/core";
import type { ISpellValue } from "../types.ts";
import { SpellValueEffectivenessItem } from "./spellValueEffectivenessItem.ts";
import { SpellValueFixedUnit } from "./spellValueFixedUnit.ts";
import { SpellValuePercentUnit } from "./spellValuePercentUnit.ts";

export const SpellValueSchema = defineEntity({
    name: "SpellValue",
    embeddable: true,
    properties: {
        base: p.integer(),
        unit: () => p.embedded([SpellValueFixedUnit, SpellValuePercentUnit]).object(),
        effectiveness: () => p.embedded(SpellValueEffectivenessItem).array().nullable(),
    },
});

export class SpellValue extends SpellValueSchema.class implements ISpellValue {}
SpellValueSchema.setClass(SpellValue);
