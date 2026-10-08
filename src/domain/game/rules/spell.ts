import { ESpellDraggingMode } from "../models/spell.types.ts";

type TSpellDraggingMode = (typeof ESpellDraggingMode)[keyof typeof ESpellDraggingMode];

export function draggingModeKind(draggingModes: readonly TSpellDraggingMode[]): TSpellDraggingMode {
    return draggingModes.every((draggingMode) => draggingMode === ESpellDraggingMode.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}

const Spell = {
    draggingModeKind,
};

export default Spell;
