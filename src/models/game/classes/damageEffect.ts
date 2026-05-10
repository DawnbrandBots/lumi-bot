import { defineEntity, p } from "@mikro-orm/core";
import type { IDamageEffect } from "../types.ts";
import { Color } from "./color.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";

export const DamageEffectSchema = defineEntity({
    name: 'DamageEffect',
    embeddable: true,
    discriminatorValue: "DAMAGE",
    extends: SpellEffect,
    properties: {
        kind: p.enum(["DAMAGE"]),
        amount: () => p.embedded(SpellValue).object(),
        color: () => p.manyToOne(Color)
    },
})

export class DamageEffect extends DamageEffectSchema.class implements IDamageEffect {

    public get description() {
        const targetStr = this.target ? ` to ${this.target.asString}` : ""
        let str = `Deals ${this.amount.unit.format({ base: this.amount.base })} ${this.color.name} damage${targetStr}`
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} against ${kind} units`).join(", ")})`
            str += " " + effectivenessString
        }
        return str
    }
}
DamageEffectSchema.setClass(DamageEffect);
