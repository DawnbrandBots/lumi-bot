import { defineEntity, p } from "@mikro-orm/core";
import type { IHealEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";

export const HealEffectSchema = defineEntity({
    name: 'HealEffect',
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "HEAL",
    properties: {
        kind: p.enum(["HEAL"]),
        amount: () => p.embedded(SpellValue).object()
    },
})

export class HealEffect extends HealEffectSchema.class implements IHealEffect {

    public get description() {
        const targetStr = this.target ? ` to ${this.target.asString}` : ""
        let str = `Restores ${this.amount.unit.format({ base: this.amount.base })} HP${targetStr}`
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} for ${kind} units`).join(", ")})`
            str += " " + effectivenessString
        }
        return str
    }
}
HealEffectSchema.setClass(HealEffect);
