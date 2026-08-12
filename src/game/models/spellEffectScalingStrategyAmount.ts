import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategyAmountKind } from "../types.ts";

export const SpellEffectScalingStrategyAmountSchema = defineEntity({
    name: "SpellEffectScalingStrategyAmount",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        kind: p.enum(() => ESpellEffectScalingStrategyAmountKind),
    },
});

export abstract class SpellEffectScalingStrategyAmount extends SpellEffectScalingStrategyAmountSchema.class {}
SpellEffectScalingStrategyAmountSchema.setClass(SpellEffectScalingStrategyAmount);
