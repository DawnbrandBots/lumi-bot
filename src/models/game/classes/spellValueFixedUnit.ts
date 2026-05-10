import { defineEntity, p } from "@mikro-orm/core";
import type { ISpellValueFixedUnit } from "../types.ts";
import { SpellValueUnit } from "./spellValueUnit.ts";

export const SpellValueFixedUnitSchema = defineEntity({
    name: 'SpellValueFixedUnit',
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: "FIXED",
    properties: {
        kind: p.enum(["FIXED"])
    },
})
export class SpellValueFixedUnit extends SpellValueFixedUnitSchema.class implements ISpellValueFixedUnit {
    // TODO: fix type here :|
    // @ts-ignore
    public format({ base }) {
        return base.toString()
    }
}
SpellValueFixedUnitSchema.setClass(SpellValueFixedUnit);
