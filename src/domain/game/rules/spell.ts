import type { ISpell, TSpellDraggingModeKind } from "../models/spell.types.ts";
import { ESpellDraggingModeKind, ESpellEffectsKind } from "../models/spell.types.ts";
import type { TRootSpellEffect, TSpellEffectTargetKind } from "../models/spellEffect.types.ts";
import { ESpellEffectTarget } from "../models/spellEffect.types.ts";

export function draggingModeKind(targets: readonly TSpellEffectTargetKind[]): TSpellDraggingModeKind {
    return targets.every((target) => target === ESpellEffectTarget.SELF)
        ? ESpellDraggingModeKind.SELF
        : ESpellDraggingModeKind.ANY;
}

export function draggingMode(spell: Pick<ISpell, "effects">): ISpell["draggingMode"] {
    const mapEffects = (effects: readonly Pick<TRootSpellEffect, "target">[]) =>
        draggingModeKind(effects.map((effect) => effect.target!));

    if (spell.effects.kind === ESpellEffectsKind.NORMAL) {
        return {
            kind: ESpellEffectsKind.NORMAL,
            draggingMode: mapEffects(spell.effects.effects),
        };
    }

    return {
        kind: ESpellEffectsKind.FORM_BASED,
        light: mapEffects(spell.effects.light),
        shadow: mapEffects(spell.effects.shadow),
    };
}

const Spell = {
    draggingMode,
    draggingModeKind,
};

export default Spell;
