import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValueEffectivenessItem } from "../../../../../../domain/game/models/spellEffectValue.types.ts";
import { ESpellEffectScalingStrategy } from "../../../../../../domain/game/models/spellEffectValue.types.ts";

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
