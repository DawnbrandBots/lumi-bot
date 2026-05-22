import { defineEntity, p } from "@mikro-orm/sqlite";

export const SummonEffectStatValueSchema = defineEntity({
    name: "SummonEffectStatValue",
    embeddable: true,
    properties: {
        base: p.integer(),
        scale: p.integer().nullable(),
    },
});
export class SummonEffectStatValue extends SummonEffectStatValueSchema.class { }
SummonEffectStatValueSchema.setClass(SummonEffectStatValue);
