import { SPELL_DEFAULT_COOLDOWN, SPELL_DEFAULT_USE_COUNT } from "./constants.ts";
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
    [K in TSpellEffect["kind"]]: (effect: Extract<TSpellEffect, { kind: K }>, spell: ISpell, inline: boolean) => string;
};

function lowercaseFirstLetter(description: string): string {
    return description.charAt(0).toLowerCase() + description.slice(1);
}

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

function formatStatusEffectIntro(targetStr: string, lowercase: boolean): string {
    return `${lowercase ? "g" : "G"}rants statuses to ${targetStr}:`;
}

function describeTarget(effect: ISpellEffect, spell: ISpell, inline = false): string | null {
    if (!effect.target) {
        return null;
    }

    if (effect.target.kind === ESpellEffectTarget.SELF && spell.shape.isAoe) {
        return `targets in ${inline ? spell.shape.name : "shape"} centered around user`;
    }

    if (effect.target.kind === ESpellEffectTarget.ANY && inline) {
        return `${effect.target.asString} (${spell.shape.name})`;
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
        inline,
    }: { verb: string; object: string; effectivenessPreposition: "against" | "for"; inline: boolean },
): string {
    const target = describeTarget(effect, spell, inline);
    const targetStr = target ? ` to ${target}` : "";
    const amountStr = formatSpellEffectValue(effect.amount);
    const effectivenessStr = formatEffectiveness(effect.amount, effectivenessPreposition);

    return `${verb} ${amountStr} ${object}${targetStr}${effectivenessStr}`;
}

const SPELL_EFFECT_DESCRIPTION_FORMATTERS: TSpellEffectDescriptionFunctions = {
    DAMAGE(effect, spell, inline) {
        return describeValueEffect(effect, spell, {
            verb: "Deals",
            object: `${effect.color.name} damage`,
            effectivenessPreposition: "against",
            inline: inline,
        });
    },
    HEAL(effect, spell, inline) {
        return describeValueEffect(effect, spell, {
            verb: "Restores",
            object: "HP",
            effectivenessPreposition: "for",
            inline: inline,
        });
    },
    MOVEMENT(effect, spell, inline) {
        const plural = effect.count > 1 ? "s" : "";

        return `Moves ${describeTarget(effect, spell, inline)} ${effect.count} tile${plural} ${effect.direction.noun}`;
    },
    STAT(effect) {
        const valueStr = formatSpellEffectValue(effect.amount, effect.stat);
        const effectivenessStr = formatEffectiveness(effect.amount, "for");

        return `${effect.statChange.verb} ${effect.stat.name} by ${valueStr}${effectivenessStr} (${effect.duration == null ? "permanent" : effect.duration + " turns"})`;
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
        return `Grants effect to target tiles: ${describeSpellEffect(effect.repeat, spell, inline)}`;
    },
    SUMMON(effect) {
        const minion = `${effect.weaponType.name} ${effect.movementType.name} minion`;

        return `Summons ${minion} with ${effect.hp.base} HP and ${effect.atk.base} Atk`;
    },
} satisfies TSpellEffectDescriptionFunctions;

function describeSpellEffect<K extends TSpellEffect["kind"]>(
    effect: Extract<TSpellEffect, { kind: K }>,
    spell: ISpell,
    inline = false,
): string {
    const description = SPELL_EFFECT_DESCRIPTION_FORMATTERS[effect.kind](effect, spell, inline);
    return inline ? lowercaseFirstLetter(description) : description;
}

const REGULAR_DESCRIPTION_SEPARATOR = "\n";
const INLINE_DESCRIPTION_SEPARATOR = ", ";

function formatInlineSpellProperties(spell: ISpell): string {
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
 * @returns A string describing the spell's effects. Meant to be displayed in a response on Discord.
 */
export function describeSpellEffects(
    spell: ISpell,
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

    const firstSpellEffect = spell.effects[0]; // to please TypeScript
    // The description intro for status effects ("Grants status to <TARGETS>:") can be long.
    // This if branch moves the intro of status effects at the beginning of the resulting string
    // if all effects are of kind "STATUS" and have the same target kind, as to not repeat the
    // intro on each line.
    if (
        spell.effects.length > 1 &&
        spell.effects.every((effect) => effect.kind === "STATUS") &&
        firstSpellEffect &&
        spell.effects.every((effect) => effect.target.kind === firstSpellEffect.target?.kind)
    ) {
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
