import type { ISpell } from "../models/spell.types.ts";
import { ESpellDraggingMode, ESpellEffectsKind } from "../models/spell.types.ts";
import { ESpellEffectTarget } from "../models/spellEffect.types.ts";

type TEffectTargetInput = {
    readonly target?: keyof typeof ESpellEffectTarget | null;
};

type TSpellEffectsInput =
    | {
          readonly kind: typeof ESpellEffectsKind.NORMAL;
          readonly effects: TEffectTargetInput[];
      }
    | {
          readonly kind: typeof ESpellEffectsKind.FORM_BASED;
          readonly light: TEffectTargetInput[];
          readonly shadow: TEffectTargetInput[];
      };

export function draggingModeKind(spellData: { readonly effects: TSpellEffectsInput }): ISpell["draggingMode"] {
    // TODO: target being nullable is due to some spell effects being wrongly typed:
    // damage and healing effects can be nested, in which case they don't have a target,
    // but they always have a target at the root as effects at the rool level of Spell.effects
    // This needs to be fixed eventually!!
    const effects =
        spellData.effects.kind === ESpellEffectsKind.NORMAL
            ? spellData.effects.effects
            : [...spellData.effects.light, ...spellData.effects.shadow];

    return effects.every((effect) => effect.target === ESpellEffectTarget.SELF)
        ? ESpellDraggingMode.SELF
        : ESpellDraggingMode.ANY;
}

const Spell = {
    draggingModeKind,
};

export default Spell;
