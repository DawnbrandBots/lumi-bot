import type { PickDeep } from "type-fest";
import type { ISpellShape } from "../types.ts";

export function isAoe(shapeData: PickDeep<ISpellShape, "tiles">): boolean {
    return shapeData.tiles.includes("O");
}

const SpellShape = {
    isAoe,
};

export default SpellShape;
