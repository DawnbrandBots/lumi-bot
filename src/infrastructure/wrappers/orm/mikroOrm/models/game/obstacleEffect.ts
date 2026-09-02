import { defineEntity, p } from "@mikro-orm/sqlite";
import type { IObstacleEffect } from "../../../../../../domain/game/models/spellEffect.types.ts";
import {
    EObstacleType,
    ESpellEffectKind,
    ESpellEffectTileType,
} from "../../../../../../domain/game/models/spellEffect.types.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SummonEffectStatValue } from "./summonEffectStat.ts";

export const ObstacleEffectSchema = defineEntity({
    name: "ObstacleEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.OBSTACLE,
    properties: {
        kind: p.enum([ESpellEffectKind.OBSTACLE]),
        obstacleType: p.enum(() => EObstacleType),
        onlyOn: p.enum(() => ESpellEffectTileType).nullable(),
        hp: () => p.embedded(SummonEffectStatValue).object(),
    },
});

export class ObstacleEffect extends ObstacleEffectSchema.class implements IObstacleEffect {}
ObstacleEffectSchema.setClass(ObstacleEffect);
