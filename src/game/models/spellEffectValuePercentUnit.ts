import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectValueUnitKind, EStat, type ISpellEffectValuePercentUnit } from "../types.ts";
import { SpellEffectValueUnit } from "./spellEffectValueUnit.ts";

export const SpellEffectValuePercentUnitSchema = defineEntity({
    name: "SpellEffectValuePercentUnit",
    embeddable: true,
    extends: SpellEffectValueUnit,
    discriminatorValue: ESpellEffectValueUnitKind.PERCENT,
    properties: {
        kind: p.enum([ESpellEffectValueUnitKind.PERCENT]),
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
export class SpellEffectValuePercentUnit
    extends SpellEffectValuePercentUnitSchema.class
    implements ISpellEffectValuePercentUnit {}
SpellEffectValuePercentUnitSchema.setClass(SpellEffectValuePercentUnit);
