import type { DeepPick } from "../../utils/types.ts";
import {
    ESpellDraggingMode,
    ESpellEffectTarget,
    type ISpell,
    type ISpellDraggingMode,
    type ISpellShape,
} from "../types.ts";

/** Checks whether a spell shape covers at least one area-of-effect tile. */
export function isSpellShapeAoe(shapeData: DeepPick<ISpellShape, { tiles: true }>): boolean {
    return shapeData.tiles.includes("O");
}

/** Determines whether every root spell effect targets the user. */
export function getSpellDraggingModeKind(
    spellData: DeepPick<ISpell, { effects: { target: { kind: true } } }>,
): ISpellDraggingMode["kind"] {
    // TODO: target being nullable is due to some spell effects being wrongly typed:
    // damage and healing effects can be nested, in which case they don't have a target,
    // but they always have a target at the root as effects at the rool level of Spell.effects
    // This needs to be fixed eventually!!
    return spellData.effects.every((effect) => effect.target!.kind === ESpellEffectTarget.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}
