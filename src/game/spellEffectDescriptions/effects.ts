import { ESpellEffectKind, ESpellEffectValueUnitKind, type IStat } from "../types.ts";
import {
    describeTarget,
    type TDamageEffect,
    type THealEffect,
    type TSpellEffect,
    type TSpellEffectDescriptionContext,
    type TSpellEffectDescriptionFunctions,
    type TSpellEffectValue,
} from "./utils.ts";

function lowercaseFirstLetter(description: string): string {
    return description.charAt(0).toLowerCase() + description.slice(1);
}

function formatSpellEffectValue(amount: TSpellEffectValue, stat?: Pick<IStat, "id">): string {
    if (amount.unit.kind === ESpellEffectValueUnitKind.FIXED) {
        return amount.base.toString();
    }

    const unit = amount.unit;
    if (stat?.id === unit.stat.id) {
        return `${amount.base}%`;
    }

    return `(${amount.base}% of ${unit.stat.name})`;
}

function formatEffectiveness(amount: TSpellEffectValue, preposition: "against" | "for"): string {
    if (!amount.effectiveness?.length) {
        return "";
    }

    return ` (${amount.effectiveness.map(({ base, kind }) => `${base} ${preposition} ${kind} units`).join(", ")})`;
}

function describeValueEffect(
    effect: TDamageEffect | THealEffect,
    spell: TSpellEffectDescriptionContext,
    {
        verb,
        object,
        effectivenessPreposition,
        inline,
    }: { verb: string; object: string; effectivenessPreposition: "against" | "for"; inline: boolean },
): string {
    const target = describeTarget(effect, spell, inline);
    const targetStr = target ? ` to ${target}` : "";
    const amountStr = formatSpellEffectValue(effect.amount);
    const effectivenessStr = formatEffectiveness(effect.amount, effectivenessPreposition);

    return `${verb} ${amountStr} ${object}${targetStr}${effectivenessStr}`;
}

export const SPELL_EFFECT_DESCRIPTION_FORMATTERS = {
    DAMAGE(effect, spell, inline) {
        return describeValueEffect(effect, spell, {
            verb: "Deals",
            object: `${effect.color.name} damage`,
            effectivenessPreposition: "against",
            inline,
        });
    },
    HEAL(effect, spell, inline) {
        return describeValueEffect(effect, spell, {
            verb: "Restores",
            object: "HP",
            effectivenessPreposition: "for",
            inline,
        });
    },
    MOVEMENT(effect, spell, inline) {
        const plural = effect.count > 1 ? "s" : "";
        return `Moves ${describeTarget(effect, spell, inline)} ${effect.count} tile${plural} ${effect.direction.noun}`;
    },
    STAT(effect) {
        const valueStr = formatSpellEffectValue(effect.amount, effect.stat);
        const effectivenessStr = formatEffectiveness(effect.amount, "for");

        return `${effect.statChange.verb} ${effect.stat.name} ${effect.statChange.preposition} ${valueStr}${effectivenessStr} (${effect.duration == null ? "permanent" : effect.duration + " turns"})`;
    },
    STATUS(effect, spell, inline) {
        const description = describeSpellEffect(effect.effect, spell, inline);
        return `Grants status to ${describeTarget(effect, spell, inline)}: ${description}`;
    },
    REPEAT(effect, spell, inline) {
        return `${describeSpellEffect(effect.effect, spell, inline)} every ${effect.interval} seconds (${effect.times} times)`;
    },
    WARP() {
        return "Moves user to target tile";
    },
    ICE_BLOCK(effect) {
        return `Summons ice blocks with ${effect.hp.base} HP`;
    },
    TILE(effect, spell, inline) {
        return `Grants effect to ${describeTarget(effect, spell, inline)}: ${describeSpellEffect(effect.repeat, spell, inline)}`;
    },
    SUMMON(effect) {
        const minion = `${effect.weaponType.name} ${effect.movementType.name} minion`;
        return `Summons ${minion} with ${effect.hp.base} HP and ${effect.atk.base} Atk`;
    },
} satisfies TSpellEffectDescriptionFunctions;

export function describeSpellEffect(
    effect: TSpellEffect,
    spell: TSpellEffectDescriptionContext,
    inline = false,
): string {
    let description: string;
    switch (effect.kind) {
        case ESpellEffectKind.DAMAGE:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(effect, spell, inline);
            break;
        case ESpellEffectKind.HEAL:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.HEAL(effect, spell, inline);
            break;
        case ESpellEffectKind.MOVEMENT:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.MOVEMENT(effect, spell, inline);
            break;
        case ESpellEffectKind.STAT:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(effect);
            break;
        case ESpellEffectKind.STATUS:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS(effect, spell, inline);
            break;
        case ESpellEffectKind.REPEAT:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT(effect, spell, inline);
            break;
        case ESpellEffectKind.WARP:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.WARP();
            break;
        case ESpellEffectKind.ICE_BLOCK:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.ICE_BLOCK(effect);
            break;
        case ESpellEffectKind.TILE:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.TILE(effect, spell, inline);
            break;
        case ESpellEffectKind.SUMMON:
            description = SPELL_EFFECT_DESCRIPTION_FORMATTERS.SUMMON(effect);
            break;
    }

    return inline ? lowercaseFirstLetter(description) : description;
}
