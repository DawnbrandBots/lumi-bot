import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind } from "../../../domain/game/models/spellEffect.types.ts";
import type { IIceBlockEffect } from "../../../domain/game/models/spellEffect.types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStatValue } from "./summonEffectStat.ts";

export const IceBlockEffectSchema = defineEntity({
    name: "IceBlockEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.ICE_BLOCK,
    properties: {
        kind: p.enum([ESpellEffectKind.ICE_BLOCK]),
        hp: () => p.embedded(SummonEffectStatValue).object(),
    },
});

export class IceBlockEffect extends IceBlockEffectSchema.class implements IIceBlockEffect {}
IceBlockEffectSchema.setClass(IceBlockEffect);
