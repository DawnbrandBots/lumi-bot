import type { PickDeep } from "type-fest";
import { SPELL_DEFAULT_COOLDOWN, SPELL_DEFAULT_USE_COUNT } from "../../../../domain/game/constants.ts";
import type { EDirection } from "../../../../domain/game/models/direction.types.ts";
import type { IMovementType } from "../../../../domain/game/models/movement.types.ts";
import type { ISpell } from "../../../../domain/game/models/spell.types.ts";
import type { ESpellEffectTileType } from "../../../../domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectKind,
    ESpellEffectTarget,
    type ISpellEffect,
    type IStatusEffect,
    type TSpellEffect,
    type TSpellEffectKindToEffectMap,
} from "../../../../domain/game/models/spellEffect.types.ts";
import type {
    ISpellEffectValue,
    ISpellEffectValueEffectivenessItem,
    ISpellEffectValueFixedUnit,
    ISpellEffectValuePercentUnit,
    ISpellEffectValueUnit,
} from "../../../../domain/game/models/spellEffectValue.types.ts";
import { ESpellEffectValueUnitKind } from "../../../../domain/game/models/spellEffectValue.types.ts";
import type { EStat } from "../../../../domain/game/models/stat.types.ts";
import type { EStatChange } from "../../../../domain/game/models/statChange.types.ts";
import type { IWeaponType } from "../../../../domain/game/models/weaponType.types.ts";

export const STAT_DESCRIPTION_STRINGS = {
    HP: "HP",
    ATK: "Atk",
    RECEIVED_WEAPON_DAMAGE: "Received Weapon Damage",
    RECEIVED_SPELL_DAMAGE: "Received Spell Damage",
    MOVEMENT: "Movement",
    COLOR_AFFINITY: "Color Affinity",
    COOLDOWN: "Cooldown",
} as const satisfies Record<keyof typeof EStat, string>;

export const DIRECTION_DESCRIPTION_STRINGS = {
    UP: "up",
    DOWN: "down",
} as const satisfies Record<keyof typeof EDirection, string>;

export const STAT_CHANGE_DESCRIPTION_STRINGS = {
    INCREASE: { verb: "Increases", preposition: "by" },
    DECREASE: { verb: "Decreases", preposition: "by" },
    LIMIT: { verb: "Limits", preposition: "to" },
} as const satisfies Record<keyof typeof EStatChange, { readonly verb: string; readonly preposition: string }>;

export const SPELL_EFFECT_TARGET_DESCRIPTION_STRINGS = {
    ANY: "targets",
    SELF: "user",
    DUAL: "user and targets",
} as const satisfies Record<keyof typeof ESpellEffectTarget, string>;

export const SPELL_EFFECT_TILE_TYPE_DESCRIPTION_STRINGS = {
    GROUND: "flat ground",
    WATER: "water",
    WALL: "wall",
} as const satisfies Record<keyof typeof ESpellEffectTileType, string>;

export type TSpellEffectDescriptionContext = PickDeep<ISpell, "shape.id" | "shape.name" | "shape.isAoe">;

type TSpellEffectShapeInput = TSpellEffectDescriptionContext["shape"];

export type TSpellEffectValue = PickDeep<ISpellEffectValue, "base"> & {
    readonly effectiveness?: ReadonlyArray<PickDeep<ISpellEffectValueEffectivenessItem, "kind" | "base">> | null;
    unit: PickDeep<ISpellEffectValueFixedUnit, "kind"> | PickDeep<ISpellEffectValuePercentUnit, "kind" | "stat">;
};

type TSpellEffectTargetInput = keyof typeof ESpellEffectTarget | null | undefined;

type TEffectWithAmountInput = {
    readonly amount: TSpellEffectValue;
};

type TEffectWithOptionalTargetInput = {
    readonly target?: TSpellEffectTargetInput;
};

type TEffectWithShapeOverrideInput = {
    readonly shapeOverride?: TSpellEffectShapeInput | null;
};

type TSpellEffectDescriptionInputMapWithoutKind = {
    DAMAGE: PickDeep<TSpellEffectKindToEffectMap["DAMAGE"], "color.name"> &
        TEffectWithAmountInput &
        TEffectWithOptionalTargetInput;
    HEAL: TEffectWithAmountInput & TEffectWithOptionalTargetInput;
    MOVEMENT: PickDeep<TSpellEffectKindToEffectMap["MOVEMENT"], "target" | "count" | "direction">;
    STAT: PickDeep<TSpellEffectKindToEffectMap["STAT"], "stat" | "statChange" | "duration"> & TEffectWithAmountInput;
    REPEAT: PickDeep<TSpellEffectKindToEffectMap["REPEAT"], "interval" | "times"> & {
        readonly effect: TSpellEffectDescriptionInputMap["DAMAGE" | "HEAL"];
    };
    STATUS: {
        readonly effect: TSpellEffectDescriptionInputMap["STAT" | "REPEAT"];
        readonly target: NonNullable<TSpellEffectTargetInput>;
    };
    WARP: object;
    OBSTACLE: PickDeep<TSpellEffectKindToEffectMap["OBSTACLE"], "hp.base" | "onlyOn">;
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
        Pick<TSpellEffectKindToEffectMap[K], "kind"> &
        TEffectWithShapeOverrideInput;
};

type TRootSpellEffectKind = Exclude<keyof TSpellEffectDescriptionInputMap, "STAT" | "REPEAT">;
export type TRootSpellEffect = TSpellEffectDescriptionInputMap[TRootSpellEffectKind];

export type TDescribedSpellEffect =
    TSpellEffect | TSpellEffectDescriptionInputMap[keyof TSpellEffectDescriptionInputMap];

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
): unit is PickDeep<ISpellEffectValuePercentUnit, "kind" | "stat"> {
    return unit.kind === ESpellEffectValueUnitKind.PERCENT;
}

function formatSpellEffectValue(amount: ISpellEffectValue | TSpellEffectValue, stat?: keyof typeof EStat): string {
    if (!isPercentUnit(amount.unit)) {
        return amount.base.toString();
    }

    const unit = amount.unit;
    if (stat === unit.stat) {
        return `${amount.base}%`;
    }

    return `(${amount.base}% of ${STAT_DESCRIPTION_STRINGS[unit.stat]})`;
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

function effectShape(
    effect: TEffectWithShapeOverrideInput,
    spell: TSpellEffectDescriptionContext,
): TSpellEffectShapeInput {
    return effect.shapeOverride ?? spell.shape;
}

function shouldDescribeShape(effect: TEffectWithShapeOverrideInput, inline: boolean): boolean {
    return inline || !!effect.shapeOverride;
}

function describeTargetTiles(
    effect: TEffectWithShapeOverrideInput & { readonly onlyOn?: keyof typeof ESpellEffectTileType | null },
    spell: TSpellEffectDescriptionContext,
    inline: boolean,
): string {
    const tileType = effect.onlyOn ? ` ${SPELL_EFFECT_TILE_TYPE_DESCRIPTION_STRINGS[effect.onlyOn]}` : "";
    const shapeStr = shouldDescribeShape(effect, inline) ? ` on a ${effectShape(effect, spell).name}` : "";

    return `target${tileType} tiles${shapeStr}`;
}

function describeTileCondition(effect: { readonly onlyOn?: keyof typeof ESpellEffectTileType | null }): string {
    if (!effect.onlyOn) {
        return "";
    }

    const tileType = SPELL_EFFECT_TILE_TYPE_DESCRIPTION_STRINGS[effect.onlyOn];

    return ` if it is ${tileType}`;
}

function haveSameShapeOverride(a: TEffectWithShapeOverrideInput, b: TEffectWithShapeOverrideInput): boolean {
    return a.shapeOverride?.id == b.shapeOverride?.id;
}

function describeTarget(
    effect: PickDeep<ISpellEffect, "kind"> & TEffectWithShapeOverrideInput & { target?: TSpellEffectTargetInput },
    spell: TSpellEffectDescriptionContext,
    inline = false,
): string | null {
    if (!effect.target) {
        return null;
    }

    const shape = effectShape(effect, spell);
    const includeShape = shouldDescribeShape(effect, inline);

    if (effect.target === ESpellEffectTarget.SELF && shape.isAoe) {
        return `targets ${includeShape ? `on a ${shape.name}` : "in shape"} centered around user`;
    }

    if (effect.kind === ESpellEffectKind.TILE) {
        return describeTargetTiles(effect, spell, inline);
    }

    if (effect.target === ESpellEffectTarget.ANY && includeShape) {
        return `${SPELL_EFFECT_TARGET_DESCRIPTION_STRINGS[effect.target]} on a ${shape.name}`;
    }

    return SPELL_EFFECT_TARGET_DESCRIPTION_STRINGS[effect.target];
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

        return `Moves ${describeTarget(effect, spell, inline)} ${effect.count} tile${plural} ${DIRECTION_DESCRIPTION_STRINGS[effect.direction]}`;
    },
    STAT(effect) {
        const valueStr = formatSpellEffectValue(effect.amount, effect.stat);
        const effectivenessStr = formatEffectiveness(effect.amount, "for");
        const statChange = STAT_CHANGE_DESCRIPTION_STRINGS[effect.statChange];

        return `${statChange.verb} ${STAT_DESCRIPTION_STRINGS[effect.stat]} ${statChange.preposition} ${valueStr}${effectivenessStr} (${effect.duration == null ? "permanent" : effect.duration + " turns"})`;
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
    OBSTACLE(effect, spell, inline) {
        const shape = effectShape(effect, spell);
        const obstaclesStr = shape.isAoe ? "obstacles" : "an obstacle";
        const placementStr = !shape.isAoe
            ? ` on a ${shape.name}`
            : effect.onlyOn || effect.shapeOverride || inline
              ? ` on ${describeTargetTiles(effect, spell, inline)}`
              : "";
        const tileConditionStr = !shape.isAoe ? describeTileCondition(effect) : "";

        return `Summons ${obstaclesStr} with ${effect.hp.base} HP${placementStr}${tileConditionStr}`;
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
        statusEffects.every(
            (effect) => effect.target === firstStatusEffect.target && haveSameShapeOverride(effect, firstStatusEffect),
        )
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
