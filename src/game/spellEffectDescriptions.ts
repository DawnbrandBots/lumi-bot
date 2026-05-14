import {
    ESpellEffectTarget,
    ESpellEffectValueUnitKind,
    type ISpell,
    type ISpellEffect,
    type ISpellEffectValue,
    type ISpellEffectValuePercentUnit,
    type IStat,
    type TSpellEffect,
} from "./types.ts";

type TSpellEffectDescriptionFunctions = {
    [K in TSpellEffect["kind"]]: (effect: Extract<TSpellEffect, { kind: K }>, spell: ISpell) => string;
};

function formatSpellEffectValue(amount: ISpellEffectValue, stat?: IStat): string {
    if (amount.unit.kind === ESpellEffectValueUnitKind.FIXED) {
        return amount.base.toString();
    }

    const unit = amount.unit as ISpellEffectValuePercentUnit;
    if (stat?.id === unit.stat.id) {
        return `${amount.base}%`;
    }

    return `(${amount.base}% of ${unit.stat.name})`;
}

function formatEffectiveness(amount: ISpellEffectValue, preposition: "against" | "for"): string {
    if (!amount.effectiveness?.length) {
        return "";
    }

    return ` (${amount.effectiveness.map(({ base, kind }) => `${base} ${preposition} ${kind} units`).join(", ")})`;
}

function formatStatusEffectIntro(targetStr: string): string {
    return `Grants status to ${targetStr}:`;
}

function describeTarget(effect: ISpellEffect, spell: ISpell): string | null {
    if (!effect.target) {
        return null;
    }

    if (effect.target.kind === ESpellEffectTarget.SELF && spell.shape.isAoe) {
        return "targets in shape centered around user";
    }

    return effect.target.asString;
}

function describeValueEffect(
    effect: ISpellEffect & { amount: ISpellEffectValue },
    spell: ISpell,
    {
        verb,
        object,
        effectivenessPreposition,
    }: { verb: string; object: string; effectivenessPreposition: "against" | "for" },
): string {
    const target = describeTarget(effect, spell);
    const targetStr = target ? ` to ${target}` : "";
    const amountStr = formatSpellEffectValue(effect.amount);
    const effectivenessStr = formatEffectiveness(effect.amount, effectivenessPreposition);

    return `${verb} ${amountStr} ${object}${targetStr}${effectivenessStr}`;
}

const SPELL_EFFECT_DESCRIPTION_FORMATTERS: TSpellEffectDescriptionFunctions = {
    DAMAGE(effect, spell) {
        return describeValueEffect(effect, spell, {
            verb: "Deals",
            object: `${effect.color.name} damage`,
            effectivenessPreposition: "against",
        });
    },
    HEAL(effect, spell) {
        return describeValueEffect(effect, spell, {
            verb: "Restores",
            object: "HP",
            effectivenessPreposition: "for",
        });
    },
    MOVEMENT(effect, spell) {
        const plural = effect.count > 1 ? "s" : "";

        return `Moves ${describeTarget(effect, spell)} ${effect.count} tile${plural} ${effect.direction.noun}`;
    },
    STAT(effect) {
        const valueStr = formatSpellEffectValue(effect.amount, effect.stat);
        const effectivenessStr = formatEffectiveness(effect.amount, "for");

        return `${effect.statChange.verb} ${effect.stat.name} by ${valueStr}${effectivenessStr} (${effect.duration == null ? "permanent" : effect.duration + " turns"})`;
    },
    STATUS(effect, spell) {
        return `Grants status to ${describeTarget(effect, spell)}: ${describeSpellEffect(effect.effect, spell)}`;
    },
    REPEAT(effect, spell) {
        return `${describeSpellEffect(effect.effect, spell)} every ${effect.interval} seconds, ${effect.times} times`;
    },
    WARP() {
        return "Moves user to target tile";
    },
    ICE_BLOCK(effect) {
        return `Summons ice blocks with ${effect.hp} HP`;
    },
    TILE(effect, spell) {
        return `Grants effect to target tiles: ${describeSpellEffect(effect.repeat, spell)}`;
    },
    SUMMON(effect) {
        const minion = `${effect.weaponType.name} ${effect.movementType.name} minion`;

        return `Summons ${minion} with ${effect.hp.base} HP and ${effect.atk.base} Atk`;
    },
} satisfies TSpellEffectDescriptionFunctions;

function describeSpellEffect<K extends TSpellEffect["kind"]>(
    effect: Extract<TSpellEffect, { kind: K }>,
    spell: ISpell,
): string {
    return SPELL_EFFECT_DESCRIPTION_FORMATTERS[effect.kind](effect, spell);
}

/**
 * @returns A string describing the spell's effects. Meant to be displayed in a response on Discord.
 */
export function describeSpellEffects(spell: ISpell): string {
    if (spell.effects.every((effect) => effect.kind === "STATUS")) {
        // TODO: target guaranteed to exist for IStatusEffect, but type should be updated to reflect that
        const target = describeTarget(spell.effects[0]!, spell)!;
        return [
            formatStatusEffectIntro(target),
            ...spell.effects
                .map((effect) => describeSpellEffect(effect.effect, spell))
                .map((description) => `1. ${description}.`),
        ].join("\n");
    } else {
        return spell.effects
            .map((effect) => describeSpellEffect(effect, spell))
            .map((description) => `1. ${description}.`)
            .join("\n");
    }
}
