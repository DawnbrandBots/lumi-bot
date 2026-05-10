import { defineEntity, p } from "@mikro-orm/core";

export const SummonEffectStatSchema = defineEntity({
    name: "SummonEffectStat",
    embeddable: true,
    properties: {
        base: p.integer(),
        scale: p.integer().nullable()
    }
})
export class SummonEffectStat extends SummonEffectStatSchema.class { }
SummonEffectStatSchema.setClass(SummonEffectStat)
