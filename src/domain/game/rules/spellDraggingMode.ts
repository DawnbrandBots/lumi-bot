import { ESpellDraggingModeKind, type TSpellDraggingModeKind } from "../models/spell.types.ts";
import { ESpellEffectTarget, type TRootSpellEffect } from "../models/spellEffect.types.ts";

export default function spellDraggingMode(
    effects: readonly Pick<TRootSpellEffect, "target">[],
): TSpellDraggingModeKind {
    return effects.every((effect) => effect.target === ESpellEffectTarget.SELF)
        ? ESpellDraggingModeKind.SELF
        : ESpellDraggingModeKind.ANY;
}
