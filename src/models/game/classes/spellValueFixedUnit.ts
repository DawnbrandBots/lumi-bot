import { defineEntity, p } from "@mikro-orm/core";
import { ESpellValueUnitKind, type ISpellValueFixedUnit } from "../types.ts";
import { SpellValueUnit } from "./spellValueUnit.ts";

export const SpellValueFixedUnitSchema = defineEntity({
    name: "SpellValueFixedUnit",
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: ESpellValueUnitKind.FIXED,
    properties: {
        // TODO: huh?????
        kind: p.enum([ESpellValueUnitKind.FIXED]),
    },
});
export class SpellValueFixedUnit extends SpellValueFixedUnitSchema.class implements ISpellValueFixedUnit {
    public format({ base }: { base: number }) {
        return base.toString();
    }
}
SpellValueFixedUnitSchema.setClass(SpellValueFixedUnit);
