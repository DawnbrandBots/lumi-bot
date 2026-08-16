import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategy, type ISpellEffectValueEffectivenessItem } from "../types.ts";

export const SpellEffectValueEffectivenessItemSchema = defineEntity({
    name: "SpellEffectValueEffectivenessItem",
    embeddable: true,
    properties: {
        kind: p.string(),
        base: p.integer(),
        scalingStrategyOverride: p.enum(() => ESpellEffectScalingStrategy).nullable(),
    },
});
export class SpellEffectValueEffectivenessItem
    extends SpellEffectValueEffectivenessItemSchema.class
    implements ISpellEffectValueEffectivenessItem {}
SpellEffectValueEffectivenessItemSchema.setClass(SpellEffectValueEffectivenessItem);
