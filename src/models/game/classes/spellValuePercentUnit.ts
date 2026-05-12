import { defineEntity, p } from "@mikro-orm/core";
import { ESpellValueUnitKind, type ISpellValuePercentUnit } from "../types.ts";
import { SpellValueUnit } from "./spellValueUnit.ts";
import { Stat } from "./stat.ts";

export const SpellValuePercentUnitSchema = defineEntity({
    name: "SpellValuePercentUnit",
    embeddable: true,
    extends: SpellValueUnit,
    // TODO: enforce correct enum value at compile-time?
    discriminatorValue: ESpellValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellValueUnitKind.PERCENT]),
        stat: () => p.manyToOne(Stat),
    },
});
export class SpellValuePercentUnit extends SpellValuePercentUnitSchema.class implements ISpellValuePercentUnit {
    public format({ base }: { base: number }) {
        return `(${base}% of ${this.stat.name})`;
    }
}
SpellValuePercentUnitSchema.setClass(SpellValuePercentUnit);

// TODO: need to add some check that classes are assigned to the right schemas
// some combinations are not incompatible and not reported by TypeScript,
// namely when assigning an extending class
// to an extended schema, and this causes errors during discovery
