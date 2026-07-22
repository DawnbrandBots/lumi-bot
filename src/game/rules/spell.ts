import type { PickDeep } from "type-fest";
import { ESpellDraggingMode, ESpellEffectTarget, type ISpell, type ISpellDraggingMode } from "../types.ts";

export function draggingModeKind(
    spellData: PickDeep<ISpell, `effects.${number}.target`> | PickDeep<ISpell, `effects.${number}.target.kind`>,
): ISpellDraggingMode["kind"] {
    return spellData.effects.every((effect) => effect.target!.kind === ESpellEffectTarget.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}

const Spell = {
    draggingModeKind,
};

export default Spell;
