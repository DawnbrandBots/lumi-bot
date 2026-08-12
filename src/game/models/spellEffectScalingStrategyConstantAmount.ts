import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategyAmountKind, type ISpellEffectScalingStrategyConstantAmount } from "../types.ts";
import { SpellEffectScalingStrategyAmount } from "./spellEffectScalingStrategyAmount.ts";

export const SpellEffectScalingStrategyConstantAmountSchema = defineEntity({
    name: "SpellEffectScalingStrategyConstantAmount",
    embeddable: true,
    extends: SpellEffectScalingStrategyAmount,
    discriminatorValue: ESpellEffectScalingStrategyAmountKind.CONSTANT,
    properties: {
        kind: p.enum([ESpellEffectScalingStrategyAmountKind.CONSTANT]),
        value: p.float(),
    },
});

export class SpellEffectScalingStrategyConstantAmount
    extends SpellEffectScalingStrategyConstantAmountSchema.class
    implements ISpellEffectScalingStrategyConstantAmount {}
SpellEffectScalingStrategyConstantAmountSchema.setClass(SpellEffectScalingStrategyConstantAmount);
