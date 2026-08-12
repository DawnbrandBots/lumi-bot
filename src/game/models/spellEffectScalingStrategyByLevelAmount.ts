import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategyAmountKind, type ISpellEffectScalingStrategyByLevelAmount } from "../types.ts";
import { SpellEffectScalingStrategyAmount } from "./spellEffectScalingStrategyAmount.ts";

export const SpellEffectScalingStrategyByLevelAmountSchema = defineEntity({
    name: "SpellEffectScalingStrategyByLevelAmount",
    embeddable: true,
    extends: SpellEffectScalingStrategyAmount,
    discriminatorValue: ESpellEffectScalingStrategyAmountKind.BY_LEVEL,
    properties: {
        kind: p.enum([ESpellEffectScalingStrategyAmountKind.BY_LEVEL]),
        values: p.json<ISpellEffectScalingStrategyByLevelAmount["values"]>(),
    },
});

export class SpellEffectScalingStrategyByLevelAmount
    extends SpellEffectScalingStrategyByLevelAmountSchema.class
    implements ISpellEffectScalingStrategyByLevelAmount {}
SpellEffectScalingStrategyByLevelAmountSchema.setClass(SpellEffectScalingStrategyByLevelAmount);
