import type { DeepPick } from "../../utils/types.ts";
import type { ISpellShape } from "../types.ts";

/** Checks whether a spell shape covers at least one area-of-effect tile. */
export function isAoe(shapeData: DeepPick<ISpellShape, { tiles: true }>): boolean {
    return shapeData.tiles.includes("O");
}

/** Domain rules for spell shapes. */
const SpellShape = {
    isAoe,
};

export default SpellShape;
