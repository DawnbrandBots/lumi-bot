import { defineEntity, p } from "@mikro-orm/core";
import type { ISpellValueUnit } from "../types.ts";

export const SpellValueUnitSchema = defineEntity({
    name: 'SpellValueUnit',
    embeddable: true,
    abstract: true,
    discriminatorColumn: "kind",
    properties: {
        // TODO: do the same for other abstract classes kinds?
        kind: p.enum(["FIXED", "PERCENT"])
    },
})
export abstract class SpellValueUnit extends SpellValueUnitSchema.class implements ISpellValueUnit { }
SpellValueUnitSchema.setClass(SpellValueUnit);
