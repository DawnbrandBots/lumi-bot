import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectValueUnitKind, type ISpellEffectValueUnit } from "../types.ts";

export const SpellEffectValueUnitSchema = defineEntity({
    name: "SpellEffectValueUnit",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        // TODO: do the same for other abstract classes kinds?
        kind: p.enum([ESpellEffectValueUnitKind.FIXED, ESpellEffectValueUnitKind.PERCENT]),
    },
});
export abstract class SpellEffectValueUnit extends SpellEffectValueUnitSchema.class implements ISpellEffectValueUnit {}
SpellEffectValueUnitSchema.setClass(SpellEffectValueUnit);
