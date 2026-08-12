import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValueEffectivenessItem } from "../types.ts";
import { SpellEffectScalingStrategy } from "./spellEffectScalingStrategy.ts";

export const SpellEffectValueEffectivenessItemSchema = defineEntity({
    name: "SpellEffectValueEffectivenessItem",
    embeddable: true,
    properties: {
        kind: p.string(),
        base: p.integer(),
        scalingStrategy: () => p.manyToOne(SpellEffectScalingStrategy).nullable(),
    },
});
export class SpellEffectValueEffectivenessItem
    extends SpellEffectValueEffectivenessItemSchema.class
    implements ISpellEffectValueEffectivenessItem {}
SpellEffectValueEffectivenessItemSchema.setClass(SpellEffectValueEffectivenessItem);
