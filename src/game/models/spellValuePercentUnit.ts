import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellValueUnitKind, type ISpellValuePercentUnit } from "../types.ts";
import { SpellValueUnit } from "./spellValueUnit.ts";
import { StatType } from "./stat.ts";

export const SpellValuePercentUnitSchema = defineEntity({
    name: "SpellValuePercentUnit",
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: ESpellValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellValueUnitKind.PERCENT]),
        stat: p.type(StatType),
    },
});
export class SpellValuePercentUnit extends SpellValuePercentUnitSchema.class implements ISpellValuePercentUnit { }
SpellValuePercentUnitSchema.setClass(SpellValuePercentUnit);
