import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectValueUnitKind } from "../../../domain/game/models/spellEffectValue.types.ts";
import type { ISpellEffectValuePercentUnit } from "../../../domain/game/models/spellEffectValue.types.ts";
import { SpellEffectValueUnit } from "./spellEffectValueUnit.ts";
import { StatType } from "./stat.ts";

export const SpellEffectValuePercentUnitSchema = defineEntity({
    name: "SpellEffectValuePercentUnit",
    embeddable: true,
    extends: SpellEffectValueUnit,
    discriminatorValue: ESpellEffectValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellEffectValueUnitKind.PERCENT]),
        stat: p.type(StatType),
    },
});
export class SpellEffectValuePercentUnit
    extends SpellEffectValuePercentUnitSchema.class
    implements ISpellEffectValuePercentUnit {}
SpellEffectValuePercentUnitSchema.setClass(SpellEffectValuePercentUnit);
