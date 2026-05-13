import { defineEntity, p } from "@mikro-orm/core";
import type { IWarpEffect } from "../types.ts";
import { SpellEffect } from "./spellEffect.ts";

export const WarpEffectSchema = defineEntity({
    name: "WarpEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "WARP",
    properties: {
        kind: p.enum(["WARP"]),
    },
});

export class WarpEffect extends WarpEffectSchema.class implements IWarpEffect {
}
WarpEffectSchema.setClass(WarpEffect);
