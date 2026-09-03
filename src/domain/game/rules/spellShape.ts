import type { PickDeep } from "type-fest";
import type { ISpellShape } from "../models/spell.types.ts";

export function isAoe(shapeData: PickDeep<ISpellShape, "tiles">): boolean {
    return shapeData.tiles.includes("O");
}

const SpellShape = {
    isAoe,
};

export default SpellShape;
