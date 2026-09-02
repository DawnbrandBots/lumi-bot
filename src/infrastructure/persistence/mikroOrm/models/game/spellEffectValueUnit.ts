import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellEffectValueUnit } from "../../../../../domain/game/models/spellEffectValue.types.ts";
import { ESpellEffectValueUnitKind } from "../../../../../domain/game/models/spellEffectValue.types.ts";

export const SpellEffectValueUnitSchema = defineEntity({
    name: "SpellEffectValueUnit",
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        kind: p.enum(() => ESpellEffectValueUnitKind),
    },
});
export abstract class SpellEffectValueUnit extends SpellEffectValueUnitSchema.class implements ISpellEffectValueUnit {}
SpellEffectValueUnitSchema.setClass(SpellEffectValueUnit);
