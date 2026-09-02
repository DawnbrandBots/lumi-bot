import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValuePercentUnit } from "../../../../../domain/game/models/spellEffectValue.types.ts";
import { ESpellEffectValueUnitKind } from "../../../../../domain/game/models/spellEffectValue.types.ts";
import { EStat } from "../../../../../domain/game/models/stat.types.ts";
import { SpellEffectValueUnit } from "./spellEffectValueUnit.ts";

export const SpellEffectValuePercentUnitSchema = defineEntity({
    name: "SpellEffectValuePercentUnit",
    embeddable: true,
    extends: SpellEffectValueUnit,
    discriminatorValue: ESpellEffectValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellEffectValueUnitKind.PERCENT]),
        stat: p.enum(() => EStat),
    },
});
export class SpellEffectValuePercentUnit
    extends SpellEffectValuePercentUnitSchema.class
    implements ISpellEffectValuePercentUnit {}
SpellEffectValuePercentUnitSchema.setClass(SpellEffectValuePercentUnit);
