import type { PickDeep } from "type-fest";
import { SPELL_DEFAULT_COOLDOWN, SPELL_DEFAULT_USE_COUNT } from "../../../../domain/game/constants.ts";
import type { EDirection } from "../../../../domain/game/models/direction.types.ts";
import {
    ESpellCastKind,
    type ISpell,
    type ISpellCastProperties,
    type TSpellCast,
} from "../../../../domain/game/models/spell.types.ts";
import type { ESpellEffectTileType } from "../../../../domain/game/models/spellEffect.types.ts";
import {
    ESpellEffectKind,
    ESpellEffectTarget,
    type ISpellEffect,
    type IStatusEffect,
    type TRootSpellEffect as TDomainRootSpellEffect,
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
import {
    describeUnitSelector,
    type TUnitSelectorDescriptionInput,
} from "./spellEffectDescriptions/unitSelectorDescriptions.ts";

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

export type TSpellEffectDescriptionContext = PickDeep<ISpellCastProperties, "shape.id" | "shape.name" | "shape.isAoe">;

type TSpellEffectShapeInput = TSpellEffectDescriptionContext["shape"];

export type TSpellEffectValue = PickDeep<ISpellEffectValue, "base"> & {
    readonly effectiveness?: ReadonlyArray<
        PickDeep<ISpellEffectValueEffectivenessItem, "base"> & {
            readonly appliesTo: TUnitSelectorDescriptionInput;
        }
    > | null;
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
    STAT: PickDeep<TSpellEffectKindToEffectMap["STAT"], "stat" | "statChange" | "duration" | "onlyFor"> &
        TEffectWithAmountInput;
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
type TRootSpellEffectInput = TDomainRootSpellEffect | TRootSpellEffect;

export type TDescribedSpellEffect =
    TSpellEffect | TSpellEffectDescriptionInputMap[keyof TSpellEffectDescriptionInputMap];

type TSpellEffectCastDescriptionInput = TSpellEffectDescriptionContext &
    Pick<ISpellCastProperties, "countdown" | "cooldown"> & {
        readonly effects: readonly TRootSpellEffectInput[];
    };

export type TSpellEffectDescriptionsInput = Pick<ISpell, "uses"> & {
    readonly cast: TSpellCast<TSpellEffectCastDescriptionInput>;
    readonly onlyFor?: Readonly<{ name: string }> | null;
};

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

    return `${amount.effectiveness
        .map(({ base, appliesTo }) => `${base} ${preposition} ${describeUnitSelector(appliesTo)}`)
        .join(", ")}`;
}

function isStatusEffect(
    effect: TRootSpellEffectInput,
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

    return `${verb} ${amountStr} ${object}${targetStr}${effectivenessStr && ` (${effectivenessStr})`}`;
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
        const onlyForStr = effect.onlyFor ? `${describeUnitSelector(effect.onlyFor)} only` : "";

        return `${statChange.verb} ${STAT_DESCRIPTION_STRINGS[effect.stat]} ${statChange.preposition} ${valueStr} (${[effectivenessStr, onlyForStr, effect.duration == null ? "permanent" : effect.duration + " turns"].filter((s) => !!s).join(", ")})`;
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

export function formatSpellCooldown(
    arg: Readonly<{ cast: TSpellCast<{ readonly cooldown: number }>; inline: boolean }>,
): string | undefined {
    if (arg.cast.kind === ESpellCastKind.FORM_BASED && arg.cast.light.cooldown !== arg.cast.shadow.cooldown) {
        return `Cooldown: ${arg.cast.light.cooldown}s (Light form), ${arg.cast.shadow.cooldown}s (Shadow form)`;
    }

    const cooldown = arg.cast.kind === ESpellCastKind.NORMAL ? arg.cast.cooldown : arg.cast.light.cooldown;
    if (arg.inline) {
        return cooldown === SPELL_DEFAULT_COOLDOWN ? undefined : `Cooldown: ${cooldown}`;
    }
    return `${cooldown}s cooldown`;
}

function formatInlineSpellProperties(spell: TSpellEffectDescriptionsInput): string {
    const properties: string[] = [];

    // TODO: ?? because uses can also be undefined. This field should be number only, with Infinity as default value.
    if ((spell.uses ?? SPELL_DEFAULT_USE_COUNT) !== SPELL_DEFAULT_USE_COUNT) {
        properties.push(`Uses: ${spell.uses}`);
    }

    const cooldown = formatSpellCooldown({ cast: spell.cast, inline: true });
    if (cooldown) {
        properties.push(cooldown);
    }

    if (spell.onlyFor) {
        properties.push(`Usable only by ${spell.onlyFor.name} units`);
    }

    return properties.length ? ` (${properties.join(", ")})` : "";
}

function describeNormalSpellEffects(cast: TSpellEffectCastDescriptionInput, inline: boolean): string {
    const effects = cast.effects;
    if (effects.length === 0) {
        return "";
    }

    let res = "";

    const statusEffects = effects.filter(isStatusEffect);
    const firstStatusEffect = statusEffects[0];
    // The description intro for status effects ("Grants status to <TARGETS>:") can be long.
    // This if branch moves the intro of status effects at the beginning of the resulting string
    // if all effects are of kind "STATUS" and have the same target kind, as to not repeat the
    // intro on each line.
    if (
        effects.length > 1 &&
        statusEffects.length === effects.length &&
        firstStatusEffect &&
        statusEffects.every(
            (effect) => effect.target === firstStatusEffect.target && haveSameShapeOverride(effect, firstStatusEffect),
        )
    ) {
        // TODO: target guaranteed to exist for IStatusEffect, but type should be updated to reflect that
        const target = describeTarget(firstStatusEffect, cast, inline)!;
        const descriptions = statusEffects.map((effect) => describeSpellEffect(effect.effect, cast, inline));
        if (inline) {
            res += `Grants "${descriptions.map(lowercaseFirstLetter).join(INLINE_DESCRIPTION_SEPARATOR)}" to ${target}.`;
        } else {
            res += [`Grants statuses to ${target}:`, ...descriptions.map((description) => `1. ${description}.`)].join(
                REGULAR_DESCRIPTION_SEPARATOR,
            );
        }
    } else {
        const descriptions = effects.map((effect) => describeSpellEffect(effect, cast, inline));
        res += inline
            ? `${[descriptions[0]!, ...descriptions.slice(1).map(lowercaseFirstLetter)].join(INLINE_DESCRIPTION_SEPARATOR)}.`
            : descriptions.map((description) => `1. ${description}.`).join(REGULAR_DESCRIPTION_SEPARATOR);
    }

    if (!cast.countdown) {
        return res;
    }
    const countdown = `After ${cast.countdown} ${cast.countdown === 1 ? "second" : "seconds"}`;
    return inline
        ? `${countdown}, ${lowercaseFirstLetter(res)}`
        : `${countdown}:${REGULAR_DESCRIPTION_SEPARATOR}${res}`;
}

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
    if (spell.cast.kind === ESpellCastKind.NORMAL) {
        const description = describeNormalSpellEffects(spell.cast, inline);
        return inline ? description + formatInlineSpellProperties(spell) : description;
    }

    const light = describeNormalSpellEffects(spell.cast.light, inline);
    const shadow = describeNormalSpellEffects(spell.cast.shadow, inline);

    if (inline) {
        const differentShapes = spell.cast.light.shape.id !== spell.cast.shadow.shape.id;
        const lightShape =
            differentShapes && !light.includes(spell.cast.light.shape.name)
                ? ` (targets ${spell.cast.light.shape.name})`
                : "";
        const shadowShape =
            differentShapes && !shadow.includes(spell.cast.shadow.shape.name)
                ? ` (targets ${spell.cast.shadow.shape.name})`
                : "";
        const trimPeriod = (description: string) => description.replace(/\.$/, "");
        const description = `In Light form${lightShape}: ${lowercaseFirstLetter(trimPeriod(light))}; in Shadow form${shadowShape}: ${lowercaseFirstLetter(trimPeriod(shadow))}.`;
        return description + formatInlineSpellProperties(spell);
    }

    return ["In Light form:", light, "In Shadow form:", shadow].join(REGULAR_DESCRIPTION_SEPARATOR);
}
