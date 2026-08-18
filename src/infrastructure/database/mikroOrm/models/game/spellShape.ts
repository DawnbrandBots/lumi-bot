import { defineEntity, p } from "@mikro-orm/sqlite";
import SpellShapeRules from "../../../../../domain/game/rules/spellShape.ts";
import type { ISpellShape } from "../../../../../domain/game/models/spell.types.ts";

export const SpellShapeSchema = defineEntity({
    name: "SpellShape",
    properties: {
        id: p.string().primary(),
        name: p.string(),
        tiles: p.string().length(25),
    },
});
export class SpellShape extends SpellShapeSchema.class implements ISpellShape {
    public get isAoe(): boolean {
        return SpellShapeRules.isAoe(this);
    }
}
SpellShapeSchema.setClass(SpellShape);
