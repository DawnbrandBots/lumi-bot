import type { DeepPick } from "../../utils/types.ts";
import type { ISpellShape } from "../types.ts";

export function isAoe(shapeData: DeepPick<ISpellShape, { tiles: true }>): boolean {
    return shapeData.tiles.includes("O");
}

const SpellShape = {
    isAoe,
};

export default SpellShape;
