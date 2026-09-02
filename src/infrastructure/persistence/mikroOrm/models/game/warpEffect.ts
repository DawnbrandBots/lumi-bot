import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IWarpEffect } from "../../../../../domain/game/models/spellEffect.types.ts";
import { ESpellEffectKind } from "../../../../../domain/game/models/spellEffect.types.ts";
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

export class WarpEffect extends WarpEffectSchema.class implements IWarpEffect {}
WarpEffectSchema.setClass(WarpEffect);
