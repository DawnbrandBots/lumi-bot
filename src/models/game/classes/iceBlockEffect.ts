import { defineEntity, p } from "@mikro-orm/core";
import type { IIceBlockEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";

export const IceBlockEffectSchema = defineEntity({
    name: 'IceBlockEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "ICE_BLOCK",
    properties: {
        kind: p.enum(["ICE_BLOCK"]),
        hp: p.integer()
    },
})

export class IceBlockEffect extends IceBlockEffectSchema.class implements IIceBlockEffect {

    public get description() {
        return `Summons ice blocks with ${this.hp} HP`
    }
}
IceBlockEffectSchema.setClass(IceBlockEffect);
