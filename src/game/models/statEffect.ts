import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, EStat, EStatChange, type IStatEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectValue } from "./spellEffectValue.ts";

export const StatEffectSchema = defineEntity({
    name: "StatEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.STAT,
    properties: {
        kind: p.enum([ESpellEffectKind.STAT]),
        statChange: p.enum([EStatChange.INCREASE, EStatChange.DECREASE, EStatChange.LIMIT]),
        amount: () => p.embedded(SpellEffectValue).object(),
        duration: p.integer().nullable(),
        stat: p.enum([
            EStat.HP,
            EStat.ATK,
            EStat.RECEIVED_WEAPON_DAMAGE,
            EStat.RECEIVED_SPELL_DAMAGE,
            EStat.MOVEMENT,
            EStat.COLOR_AFFINITY,
            EStat.COOLDOWN,
        ]),
    },
});

export class StatEffect extends StatEffectSchema.class implements IStatEffect {}
StatEffectSchema.setClass(StatEffect);
