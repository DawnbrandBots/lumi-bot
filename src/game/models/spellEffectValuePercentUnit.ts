import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectValueUnitKind, type ISpellEffectValuePercentUnit } from "../types.ts";
import { SpellEffectValueUnit } from "./spellEffectValueUnit.ts";
import { StatType } from "./stat.ts";

export const SpellEffectValuePercentUnitSchema = defineEntity({
    name: "SpellEffectValuePercentUnit",
    embeddable: true,
    extends: SpellEffectValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: ESpellEffectValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellEffectValueUnitKind.PERCENT]),
        stat: p.type(StatType),
    },
});
export class SpellEffectValuePercentUnit
    extends SpellEffectValuePercentUnitSchema.class
    implements ISpellEffectValuePercentUnit { }
SpellEffectValuePercentUnitSchema.setClass(SpellEffectValuePercentUnit);
