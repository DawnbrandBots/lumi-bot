import { defineEntity, p } from "@mikro-orm/sqlite";
import type { ISpellShape } from "../types.ts";

export const SpellShapeSchema = defineEntity({
    name: "SpellShape",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        tiles: p.string().length(25),
    },
});
export class SpellShape extends SpellShapeSchema.class implements ISpellShape {
    public get isAoe() {
        return this.tiles.includes("O");
    }
}
SpellShapeSchema.setClass(SpellShape);
