import type { DeepPick } from "../../utils/types.ts";
import { ESpellDraggingMode, ESpellEffectTarget, type ISpell, type ISpellDraggingMode } from "../types.ts";

export function draggingModeKind(
    spellData: DeepPick<ISpell, { effects: { target: { kind: true } } }>,
): ISpellDraggingMode["kind"] {
    return spellData.effects.every((effect) => effect.target!.kind === ESpellEffectTarget.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}

const Spell = {
    draggingModeKind,
};

export default Spell;
