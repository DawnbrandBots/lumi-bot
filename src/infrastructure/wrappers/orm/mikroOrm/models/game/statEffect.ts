import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IStatEffect } from "../../../../../../domain/game/models/spellEffect.types.ts";
import { ESpellEffectKind } from "../../../../../../domain/game/models/spellEffect.types.ts";
import { EStat } from "../../../../../../domain/game/models/stat.types.ts";
import { EStatChange } from "../../../../../../domain/game/models/statChange.types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectValue } from "./spellEffectValue.ts";

export const StatEffectSchema = defineEntity({
    name: "StatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.STAT,
    properties: {
        kind: p.enum([ESpellEffectKind.STAT]),
        statChange: p.enum(() => EStatChange),
        amount: () => p.embedded(SpellEffectValue).object(),
        duration: p.integer().nullable(),
        stat: p.enum(() => EStat),
    },
});

export class StatEffect extends StatEffectSchema.class implements IStatEffect {}
StatEffectSchema.setClass(StatEffect);
