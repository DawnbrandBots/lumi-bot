import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ITileEffect } from "../../../../../domain/game/models/spellEffect.types.ts";
import { ESpellEffectKind } from "../../../../../domain/game/models/spellEffect.types.ts";
import { RepeatEffect } from "./repeatEffect.ts";
import { SpellEffect } from "./spellEffect.ts";

export const TileEffectSchema = defineEntity({
    name: "TileEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.TILE,
    properties: {
        kind: p.enum([ESpellEffectKind.TILE]),
        effect: () => p.embedded(RepeatEffect).object(),
    },
});

export class TileEffect extends TileEffectSchema.class implements ITileEffect {}
TileEffectSchema.setClass(TileEffect);
