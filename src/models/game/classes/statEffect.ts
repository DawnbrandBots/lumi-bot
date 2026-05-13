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
}
StatEffectSchema.setClass(StatEffect);
