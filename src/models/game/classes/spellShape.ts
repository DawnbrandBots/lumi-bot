import { defineEntity, p } from "@mikro-orm/core";
import type { ISpellShape } from "../types.ts";

export const SpellShapeSchema = defineEntity({
    name: "SpellShape",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        tiles: p.string().length(25),
    },
});
export abstract class SpellShape extends SpellShapeSchema.class implements ISpellShape {}
SpellShapeSchema.setClass(SpellShape);
