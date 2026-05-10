import { defineEntity, p } from "@mikro-orm/core";
import type { IStatEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";
import { Stat } from "./stat.ts";
import { StatChange } from "./statChange.ts";

export const StatEffectSchema = defineEntity({
    name: "StatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "STAT",
    properties: {
        kind: p.enum(["STAT"]),
        statChange: () => p.manyToOne(StatChange),
        amount: () => p.embedded(SpellValue).object(),
        duration: p.integer().nullable(),
        stat: () => p.manyToOne(Stat),
    },
});

export class StatEffect extends StatEffectSchema.class implements IStatEffect {
    public get description() {
        // TODO: feels like call to format could be simplified...
        // TODO: COLOR_AFFINITY_BOOST's base values are unusual compared to other stats and do not render nicely (eg. 16.66666666...),
        // consider formatting otherwise or changing how values are expressed
        console.log(this.amount, this.stat);
        const valueStr =
            this.amount.unit.kind === "PERCENT" && this.stat.id === this.amount.unit.stat.id
                ? this.amount.base + "%"
                : this.amount.unit.format({ base: this.amount.base });
        let str = `${this.statChange.verb} ${this.stat.name} by ${valueStr}`;
        // TODO: this pattern is also repeated in damageeffect, healeffect
        if (this.amount.effectiveness?.length) {
            const effectivenessString = `(${this.amount.effectiveness.map(({ base, kind }) => `${base} for ${kind} units`).join(", ")})`;
            str += " " + effectivenessString;
        }
        return str;
    }
}
StatEffectSchema.setClass(StatEffect);
