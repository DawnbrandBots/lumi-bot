import { defineEntity, p } from "@mikro-orm/core";
import { SpellEffectTargetType } from "./spellEffectTarget.ts";

// TODO: with the current class definitions for spell effects,
// "kind" will be a property of instances instead of being inherited from the prototype.
// Look for a way to move kind back to the prototype while
// keeping the discriminator working and remaining type-safe.

export const SpellEffectSchema = defineEntity({
    name: "SpellEffect",
    embeddable: true,
    discriminatorColumn: "kind",
    abstract: true,
    properties: {
        kind: p.string(),
        // TODO: it does not make sense for nested effects (STAT, REPEAT and DAMAGE or HEALING when nested) to have a target property
        target: p.type(SpellEffectTargetType).nullable(),
    },
});
export abstract class SpellEffect extends SpellEffectSchema.class {}
SpellEffectSchema.setClass(SpellEffect);
