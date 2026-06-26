import { defineEntity, p } from "@mikro-orm/sqlite";
import { ESpellEffectKind, type IWarpEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";

export const WarpEffectSchema = defineEntity({
    name: "WarpEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.WARP,
    properties: {
        kind: p.enum([ESpellEffectKind.WARP]),
    },
});

export class WarpEffect extends WarpEffectSchema.class implements IWarpEffect { }
WarpEffectSchema.setClass(WarpEffect);
