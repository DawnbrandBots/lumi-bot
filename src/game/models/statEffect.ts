import { defineEntity, p } from "@mikro-orm/core";
import type { IStatEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellValue } from "./spellValue.ts";
import { StatType } from "./stat.ts";
import { StatChangeType } from "./statChange.ts";

export const StatEffectSchema = defineEntity({
    name: "StatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "STAT",
    properties: {
        kind: p.enum(["STAT"]),
        statChange: p.type(StatChangeType),
        amount: () => p.embedded(SpellValue).object(),
        duration: p.integer().nullable(),
        stat: p.type(StatType),
    },
});

export class StatEffect extends StatEffectSchema.class implements IStatEffect {}
StatEffectSchema.setClass(StatEffect);
