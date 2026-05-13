import { defineEntity, p } from "@mikro-orm/core";
import type { IMovementEffect } from "../types.ts";
import { DirectionType } from "./direction.ts";
import { SpellEffect } from "./spellEffect.ts";
import { SpellEffectTargetType } from "./spellEffectTarget.ts";

export const MovementEffectSchema = defineEntity({
    name: "MovementEffect",
    embeddable: true,
    extends: SpellEffect,
    discriminatorValue: "MOVEMENT",
    properties: {
        kind: p.enum(["MOVEMENT"]),
        direction: p.type(DirectionType),
        count: p.integer(),
        target: p.type(SpellEffectTargetType),
    },
});

export class MovementEffect extends MovementEffectSchema.class implements IMovementEffect {
}
MovementEffectSchema.setClass(MovementEffect);
