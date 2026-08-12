import { defineEntity, p } from "@mikro-orm/sqlite";
import { SpellEffectScalingStrategy } from "./spellEffectScalingStrategy.ts";

export const SummonEffectStatValueSchema = defineEntity({
    name: "SummonEffectStatValue",
    embeddable: true,
    properties: {
        base: p.integer(),
        scalingStrategy: () => p.manyToOne(SpellEffectScalingStrategy).nullable(),
    },
});
export class SummonEffectStatValue extends SummonEffectStatValueSchema.class {}
SummonEffectStatValueSchema.setClass(SummonEffectStatValue);
