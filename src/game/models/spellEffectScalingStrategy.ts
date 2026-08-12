import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectScalingStrategyKind, type ISpellEffectScalingStrategy } from "../types.ts";
import { SpellEffectScalingStrategyByLevelAmount } from "./spellEffectScalingStrategyByLevelAmount.ts";
import { SpellEffectScalingStrategyConstantAmount } from "./spellEffectScalingStrategyConstantAmount.ts";

export const SpellEffectScalingStrategySchema = defineEntity({
    name: "SpellEffectScalingStrategy",
    properties: {
        id: p.string().primary(),
        kind: p.enum(() => ESpellEffectScalingStrategyKind),
        amount: () =>
            p.embedded([SpellEffectScalingStrategyConstantAmount, SpellEffectScalingStrategyByLevelAmount]).object(),
    },
});

export class SpellEffectScalingStrategy
    extends SpellEffectScalingStrategySchema.class
    implements ISpellEffectScalingStrategy {}
SpellEffectScalingStrategySchema.setClass(SpellEffectScalingStrategy);
