import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategy } from "../../../../../domain/game/models/spellEffectValue.types.ts";

export const SummonEffectStatValueSchema = defineEntity({
    name: "SummonEffectStatValue",
    embeddable: true,
    properties: {
        base: p.integer(),
        scalingStrategyOverride: p.enum(() => ESpellEffectScalingStrategy).nullable(),
    },
});
export class SummonEffectStatValue extends SummonEffectStatValueSchema.class {}
SummonEffectStatValueSchema.setClass(SummonEffectStatValue);
