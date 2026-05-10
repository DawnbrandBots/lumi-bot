import { defineEntity, p } from "@mikro-orm/core";
import type { ITileEffect } from "../types.ts";
import { RepeatEffect } from "./repeatEffect.ts";
import { SpellEffect } from "./spellEffect.ts";

export const TileEffectSchema = defineEntity({
    name: "TileEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "TILE",
    properties: {
        kind: p.enum(["TILE"]),
        // TODO: "repeat" was originally called effect, and I wish it remained so.
        // However, a crash occurs during MikroORM's schema discovery
        // when the property is named "effect".
        // The bug seems to occur because TileEffect is listed as a possible
        // type for Spell.effects alongside StatusEffect, which also has an effect property.
        // Removing either TileEffect or StatusEffect from Spell.effects removes the crash
        // but prevents either spell effect schema's class from being used at runtime.
        // I'll try to make a minimum repro later.
        // I also looked into workarounds, like renaming "effect" into something else and making it a hidden property,
        // adding a getter named "effect" to access the hidden property, and using serializedName/fieldName
        // to assign the value from the JSON's "effect" to the now renamed hidden property.
        // However, serializedName/fieldName don't appear to work that way. Maybe that can make for a feature request?
        repeat: () => p.embedded(RepeatEffect).object(),
    },
});

export class TileEffect extends TileEffectSchema.class implements ITileEffect {
    public get description() {
        // TODO: but not urgent: using the target property in TileEffect's description
        return `Grants effect to target tiles: ${this.repeat.description}`;
    }
}
TileEffectSchema.setClass(TileEffect);
