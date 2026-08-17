import { defineEntity, p } from "@mikro-orm/sqlite";
import { EDirection } from "../../../domain/game/models/direction.types.ts";
import type { IMovementEffect } from "../../../domain/game/models/spellEffect.types.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../domain/game/models/spellEffect.types.ts";
import { SpellEffect } from "./spellEffect.ts";

export const MovementEffectSchema = defineEntity({
    name: "MovementEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: ESpellEffectKind.MOVEMENT,
    properties: {
        kind: p.enum([ESpellEffectKind.MOVEMENT]),
        direction: p.enum(() => EDirection),
        count: p.integer(),
        target: p.enum(() => ESpellEffectTarget),
    },
});

export class MovementEffect extends MovementEffectSchema.class implements IMovementEffect {}
MovementEffectSchema.setClass(MovementEffect);
