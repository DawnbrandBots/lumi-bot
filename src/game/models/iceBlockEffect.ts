import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IIceBlockEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStat } from "./summonEffectStat.ts";

export const IceBlockEffectSchema = defineEntity({
    name: "IceBlockEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "ICE_BLOCK",
    properties: {
        kind: p.enum(["ICE_BLOCK"]),
        hp: () => p.embedded(SummonEffectStat).object(),
    },
});

export class IceBlockEffect extends IceBlockEffectSchema.class implements IIceBlockEffect {}
IceBlockEffectSchema.setClass(IceBlockEffect);
