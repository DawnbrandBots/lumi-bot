import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectValueUnitKind, type ISpellEffectValueFixedUnit } from "../types.ts";
import { SpellEffectValueUnit } from "./spellEffectValueUnit.ts";

export const SpellEffectValueFixedUnitSchema = defineEntity({
    name: "SpellEffectValueFixedUnit",
    embeddable: true,
    extends: SpellEffectValueUnit,
    discriminatorValue: ESpellEffectValueUnitKind.FIXED,
    properties: {
        kind: p.enum([ESpellEffectValueUnitKind.FIXED]),
    },
});
export class SpellEffectValueFixedUnit
    extends SpellEffectValueFixedUnitSchema.class
    implements ISpellEffectValueFixedUnit { }
SpellEffectValueFixedUnitSchema.setClass(SpellEffectValueFixedUnit);
