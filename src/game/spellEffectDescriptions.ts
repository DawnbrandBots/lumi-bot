import type { PickDeep } from "type-fest";
import { SPELL_DEFAULT_COOLDOWN, SPELL_DEFAULT_USE_COUNT } from "../domain/game/constants.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../domain/game/models/spellEffect.types.ts";
import { ESpellEffectValueUnitKind } from "../domain/game/models/spellEffectValue.types.ts";
import type { IMovementType } from "../domain/game/models/movement.types.ts";
import type { ISpell } from "../domain/game/models/spell.types.ts";
import type { ISpellEffect, ISpellEffectTarget, IStatusEffect, TSpellEffect, TSpellEffectKindToEffectMap } from "../domain/game/models/spellEffect.types.ts";
import type { ISpellEffectValue, ISpellEffectValueEffectivenessItem, ISpellEffectValueFixedUnit, ISpellEffectValuePercentUnit, ISpellEffectValueUnit } from "../domain/game/models/spellEffectValue.types.ts";
import type { IStat } from "../domain/game/models/stat.types.ts";
import type { IWeaponType } from "../domain/game/models/weaponType.types.ts";

export type TSpellEffectValue = PickDeep<ISpellEffectValue, "base"> & {
    readonly effectiveness?: ReadonlyArray<PickDeep<ISpellEffectValueEffectivenessItem, "kind" | "base">> | null;
    unit:
        | PickDeep<ISpellEffectValueFixedUnit, "kind">
        | PickDeep<ISpellEffectValuePercentUnit, "kind" | "stat.id" | "stat.name">;
};

type TSpellEffectTargetInput = PickDeep<ISpellEffectTarget, "kind" | "asString"> | null | undefined;

type TEffectWithAmountInput = {
    readonly amount: TSpellEffectValue;
};

type TEffectWithOptionalTargetInput = {
    readonly target?: TSpellEffectTargetInput;
};

type TSpellEffectDescriptionInputMapWithoutKind = {
    DAMAGE: PickDeep<TSpellEffectKindToEffectMap["DAMAGE"], "color.name"> &
        TEffectWithAmountInput &
        TEffectWithOptionalTargetInput;
    HEAL: TEffectWithAmountInput & TEffectWithOptionalTargetInput;
    MOVEMENT: PickDeep<
        TSpellEffectKindToEffectMap["MOVEMENT"],
        "target.kind" | "target.asString" | "count" | "direction.noun"
    >;
    STAT: PickDeep<
        TSpellEffectKindToEffectMap["STAT"],
        "stat.id" | "stat.name" | "statChange.verb" | "statChange.preposition" | "duration"
    > &
        TEffectWithAmountInput;
    REPEAT: PickDeep<TSpellEffectKindToEffectMap["REPEAT"], "interval" | "times"> & {
        readonly effect: TSpellEffectDescriptionInputMap["DAMAGE" | "HEAL"];
    };
    STATUS: {
        readonly effect: TSpellEffectDescriptionInputMap["STAT" | "REPEAT"];
        readonly target: NonNullable<TSpellEffectTargetInput>;
    };
    WARP: object;
    ICE_BLOCK: PickDeep<TSpellEffectKindToEffectMap["ICE_BLOCK"], "hp.base">;
    TILE: TEffectWithOptionalTargetInput & {
        readonly repeat: TSpellEffectDescriptionInputMap["REPEAT"];
    };
    SUMMON: PickDeep<
        TSpellEffectKindToEffectMap["SUMMON"],
        "movementType.name" | "weaponType.name" | "hp.base" | "atk.base"
    >;
};

type TSpellEffectDescriptionInputMap = {
    [K in keyof TSpellEffectDescriptionInputMapWithoutKind]: TSpellEffectDescriptionInputMapWithoutKind[K] &
        Pick<TSpellEffectKindToEffectMap[K], "kind">;
};

type TRootSpellEffectKind = Exclude<keyof TSpellEffectDescriptionInputMap, "STAT" | "REPEAT">;
export type TRootSpellEffect = TSpellEffectDescriptionInputMap[TRootSpellEffectKind];

export type TDescribedSpellEffect =
    TSpellEffect | TSpellEffectDescriptionInputMap[keyof TSpellEffectDescriptionInputMap];

export type TSpellEffectDescriptionContext = PickDeep<ISpell, "shape.name" | "shape.isAoe">;

type TSpellEffectDescriptionOnlyFor =
    PickDeep<IMovementType, "name"> | PickDeep<IWeaponType, "name"> | null | undefined;

export type TSpellEffectDescriptionsInput = TSpellEffectDescriptionContext &
    PickDeep<ISpell, "countdown" | "uses" | "cooldown"> & {
        effects: TRootSpellEffect[];
        onlyFor?: TSpellEffectDescriptionOnlyFor;
    };

type TSpellEffectDescriptionsArgument = ISpell | TSpellEffectDescriptionsInput;

type TSpellEffectDescriptionFunctions = {
    [K in TDescribedSpellEffect["kind"]]: (
        effect: Extract<TDescribedSpellEffect, { kind: K }>,
        spell: TSpellEffectDescriptionContext,
        inline: boolean,
    ) => string;
};

function lowercaseFirstLetter(description: string): string {
    return description.charAt(0).toLowerCase() + description.slice(1);
}

function isPercentUnit(
    unit: ISpellEffectValueUnit | TSpellEffectValue["unit"],
): unit is PickDeep<ISpellEffectValuePercentUnit, "kind" | "stat.id" | "stat.name"> {
    return unit.kind === ESpellEffectValueUnitKind.PERCENT;
}

function formatSpellEffectValue(
    amount: ISpellEffectValue | TSpellEffectValue,
    stat?: PickDeep<IStat, "id" | "name">,
): string {
    if (!isPercentUnit(amount.unit)) {
        return amount.base.toString();
    }

    const unit = amount.unit;
    if (stat?.id === unit.stat.id) {
        return `${amount.base}%`;
    }

    return `(${amount.base}% of ${unit.stat.name})`;
}

function formatEffectiveness(amount: ISpellEffectValue | TSpellEffectValue, preposition: "against" | "for"): string {
    if (!amount.effectiveness?.length) {
        return "";
    }

    return ` (${amount.effectiveness.map(({ base, kind }) => `${base} ${preposition} ${kind} units`).join(", ")})`;
}

function isStatusEffect(
    effect: TSpellEffect | TRootSpellEffect,
): effect is IStatusEffect | TSpellEffectDescriptionInputMap["STATUS"] {
    return effect.kind === ESpellEffectKind.STATUS;
}

function describeTarget(
    effect: PickDeep<ISpellEffect, "kind"> & { target?: TSpellEffectTargetInput },
    spell: TSpellEffectDescriptionContext,
    inline = false,
): string | null {
    if (!effect.target) {
        return null;
    }

    if (effect.target.kind === ESpellEffectTarget.SELF && spell.shape.isAoe) {
        return `targets ${inline ? `on a ${spell.shape.name}` : "in shape"} centered around user`;
    }

    if (effect.kind === ESpellEffectKind.TILE) {
        return `target tiles${inline ? ` on a ${spell.shape.name}` : ""}`;
    }

    if (effect.target.kind === ESpellEffectTarget.ANY && inline) {
        return `${effect.target.asString} on a ${spell.shape.name}`;
    }

    return effect.target.asString;
}

function describeValueEffect(
    effect: PickDeep<ISpellEffect, "kind"> & {
        amount: ISpellEffectValue | TSpellEffectValue;
        target?: TSpellEffectTargetInput;
    },
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

export const SPELL_EFFECT_DESCRIPTION_FORMATTERS: TSpellEffectDescriptionFunctions = {
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

        return `${effect.statChange.verb} ${effect.stat.name} ${effect.statChange.preposition} ${valueStr}${effectivenessStr} (${effect.duration == null ? "permanent" : effect.duration + " turns"})`;
    },
    STATUS(effect, spell, inline) {
        const description = lowercaseFirstLetter(describeSpellEffect(effect.effect, spell, inline));
        return `Grants "${description}" to ${describeTarget(effect, spell, inline)}`;
    },
    REPEAT(effect, spell, inline) {
        const intervalStr = effect.interval > 0 ? ` every ${effect.interval} seconds` : "";
        const timesStr = effect.times === 1 ? "time" : "times";
        return `${describeSpellEffect(effect.effect, spell, inline)}${intervalStr} (${effect.times} ${timesStr})`;
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

function describeSpellEffect<K extends TDescribedSpellEffect["kind"]>(
    effect: Extract<TDescribedSpellEffect, { kind: K }>,
    spell: TSpellEffectDescriptionContext,
    inline = false,
): string {
    return SPELL_EFFECT_DESCRIPTION_FORMATTERS[effect.kind](effect, spell, inline);
}

const REGULAR_DESCRIPTION_SEPARATOR = "\n";
const INLINE_DESCRIPTION_SEPARATOR = ", ";

function formatInlineSpellProperties(spell: TSpellEffectDescriptionsArgument): string {
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
    spell: TSpellEffectDescriptionsArgument,
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
        res += `After ${spell.countdown} seconds`;
    }
    const nonEmptyRes = !!res.length;

    const statusEffects = spell.effects.filter(isStatusEffect);
    const firstStatusEffect = statusEffects[0];
    // The description intro for status effects ("Grants status to <TARGETS>:") can be long.
    // This if branch moves the intro of status effects at the beginning of the resulting string
    // if all effects are of kind "STATUS" and have the same target kind, as to not repeat the
    // intro on each line.
    if (
        spell.effects.length > 1 &&
        statusEffects.length === spell.effects.length &&
        firstStatusEffect &&
        statusEffects.every((effect) => effect.target.kind === firstStatusEffect.target.kind)
    ) {
        // TODO: target guaranteed to exist for IStatusEffect, but type should be updated to reflect that
        const target = describeTarget(firstStatusEffect, spell, inline)!;
        if (nonEmptyRes) {
            res += INLINE_DESCRIPTION_SEPARATOR;
        }
        const grantsStr = (nonEmptyRes ? "g" : "G") + "rants";
        const descriptions = statusEffects.map((effect) => describeSpellEffect(effect.effect, spell, inline));
        if (inline) {
            res += `${grantsStr} "${descriptions.map(lowercaseFirstLetter).join(INLINE_DESCRIPTION_SEPARATOR)}" to ${target}.`;
        } else {
            res += [
                `${grantsStr} statuses to ${target}:`,
                ...descriptions.map((description) => `1. ${description}.`),
            ].join(REGULAR_DESCRIPTION_SEPARATOR);
        }
    } else {
        if (nonEmptyRes) {
            res += inline ? INLINE_DESCRIPTION_SEPARATOR : ":" + REGULAR_DESCRIPTION_SEPARATOR;
        }
        const descriptions = spell.effects.map((effect) => describeSpellEffect(effect, spell, inline));
        const firstDescription = nonEmptyRes ? lowercaseFirstLetter(descriptions[0]!) : descriptions[0]!;
        res += inline
            ? `${[firstDescription, ...descriptions.slice(1).map(lowercaseFirstLetter)].join(INLINE_DESCRIPTION_SEPARATOR)}.`
            : descriptions.map((description) => `1. ${description}.`).join(REGULAR_DESCRIPTION_SEPARATOR);
    }

    return inline ? res + formatInlineSpellProperties(spell) : res;
}
