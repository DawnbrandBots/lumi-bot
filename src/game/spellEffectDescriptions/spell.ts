import { SPELL_DEFAULT_COOLDOWN, SPELL_DEFAULT_USE_COUNT } from "../constants.ts";
import { ESpellEffectKind } from "../types.ts";
import { describeSpellEffect } from "./effects.ts";
import {
    describeTarget,
    type TRootSpellEffect,
    type TSpellEffectDescriptionsInput,
    type TStatusEffect,
} from "./utils.ts";

export type { TSpellEffectDescriptionsInput } from "./utils.ts";

function isStatusEffect(effect: TRootSpellEffect): effect is TStatusEffect {
    return effect.kind === ESpellEffectKind.STATUS;
}

function areStatusesWithSameTarget(
    effects: TRootSpellEffect[],
): effects is [TStatusEffect, TStatusEffect, ...TStatusEffect[]] {
    if (effects.length < 2 || !effects.every(isStatusEffect)) {
        return false;
    }

    const firstEffect = effects[0]!;
    return effects.every((effect) => effect.target.kind === firstEffect.target.kind);
}

function formatStatusEffectIntro(targetStr: string, lowercase: boolean): string {
    return `${lowercase ? "g" : "G"}rants statuses to ${targetStr}:`;
}

const REGULAR_DESCRIPTION_SEPARATOR = "\n";
const INLINE_DESCRIPTION_SEPARATOR = ", ";

function formatInlineSpellProperties(spell: TSpellEffectDescriptionsInput): string {
    const properties: string[] = [];

    // TODO: ?? because uses can also be undefined. This field should be number only, with Infinity as default value.
    if ((spell.uses ?? SPELL_DEFAULT_USE_COUNT) !== SPELL_DEFAULT_USE_COUNT) {
        properties.push(`Uses: ${spell.uses}`);
    }

    if (spell.cooldown !== SPELL_DEFAULT_COOLDOWN) {
        properties.push(`Cooldown: ${spell.cooldown}`);
    }

    if (spell.onlyFor) {
        properties.push(`Usable only by ${spell.onlyFor.name} units`);
    }

    return properties.length ? ` (${properties.join(", ")})` : "";
}

/**
 * @returns A string describing the spell's effects. Meant to be displayed in a message on Discord.
 */
export function describeSpellEffects(
    spell: TSpellEffectDescriptionsInput,
    /**
     * If false, returns the description on multiple lines, formatted in Discord Markdown.
     *
     * If true, returns the description in a single line, similar to the in-game format.
     *
     * @default false
     */
    inline = false,
): string {
    let res = "";

    if (spell.countdown) {
        res += inline ? "after " : "After ";
        res += `${spell.countdown} seconds`;
    }
    const nonEmptyRes = !!res.length;

    // The description intro for status effects ("Grants status to <TARGETS>:") can be long.
    // This if branch moves the intro of status effects at the beginning of the resulting string
    // if all effects are of kind "STATUS" and have the same target kind, as to not repeat the
    // intro on each line.
    if (areStatusesWithSameTarget(spell.effects)) {
        const firstSpellEffect = spell.effects[0];
        // TODO: target guaranteed to exist for IStatusEffect, but type should be updated to reflect that
        const target = describeTarget(firstSpellEffect, spell, inline)!;
        if (nonEmptyRes) {
            res += INLINE_DESCRIPTION_SEPARATOR;
        }
        const statusEffectIntro = formatStatusEffectIntro(target, nonEmptyRes || inline);
        const descriptions = spell.effects.map((effect) => describeSpellEffect(effect.effect, spell, inline));
        res += inline
            ? `${statusEffectIntro} ${descriptions.join(INLINE_DESCRIPTION_SEPARATOR)}.`
            : [statusEffectIntro, ...descriptions.map((description) => `1. ${description}.`)].join(
                  REGULAR_DESCRIPTION_SEPARATOR,
              );
    } else {
        if (nonEmptyRes) {
            res += inline ? INLINE_DESCRIPTION_SEPARATOR : ":" + REGULAR_DESCRIPTION_SEPARATOR;
        }
        const descriptions = spell.effects.map((effect) => describeSpellEffect(effect, spell, inline));
        res += inline
            ? `${descriptions.join(INLINE_DESCRIPTION_SEPARATOR)}.`
            : descriptions.map((description) => `1. ${description}.`).join(REGULAR_DESCRIPTION_SEPARATOR);
    }

    return inline ? res + formatInlineSpellProperties(spell) : res;
}
