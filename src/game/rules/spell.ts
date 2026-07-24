import type { PickDeep } from "type-fest";
import { ESpellDraggingMode, ESpellEffectTarget, type ISpell, type ISpellDraggingMode } from "../types.ts";

export function draggingModeKind(
    spellData: PickDeep<ISpell, `effects.${number}.target`> | PickDeep<ISpell, `effects.${number}.target.kind`>,
): ISpellDraggingMode["kind"] {
    // TODO: target being nullable is due to some spell effects being wrongly typed:
    // damage and healing effects can be nested, in which case they don't have a target,
    // but they always have a target at the root as effects at the rool level of Spell.effects
    // This needs to be fixed eventually!!
    return spellData.effects.every((effect) => effect.target!.kind === ESpellEffectTarget.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}

const Spell = {
    draggingModeKind,
};

export default Spell;
