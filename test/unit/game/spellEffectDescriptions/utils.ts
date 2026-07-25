import type { TSpellEffectDescriptionsInput } from "../../../../src/game/spellEffectDescriptions.ts";
import { ESpellEffectTarget, ESpellEffectValueUnitKind, EStat } from "../../../../src/game/types.ts";

type TRootSpellEffect = TSpellEffectDescriptionsInput["effects"][number];
type TDamageEffect = Extract<TRootSpellEffect, { kind: "DAMAGE" }>;
type TStatusEffect = Extract<TRootSpellEffect, { kind: "STATUS" }>;
type TStatEffect = Extract<TStatusEffect["effect"], { kind: "STAT" }>;
type TSpellEffectTarget = NonNullable<TDamageEffect["target"]>;
type TSpellEffectValueUnit = TDamageEffect["amount"]["unit"];

export const SINGLE_TILE_SHAPE = {
    name: "single tile",
    isAoe: false,
} satisfies TSpellEffectDescriptionsInput["shape"];

export const CROSS_SHAPE = {
    name: "3x3 cross",
    isAoe: true,
} satisfies TSpellEffectDescriptionsInput["shape"];

export const HP_STAT = { id: EStat.HP, name: "HP" } satisfies TStatEffect["stat"];
export const ATK_STAT = { id: EStat.ATK, name: "Atk" } satisfies TStatEffect["stat"];
export const RECEIVED_WEAPON_DAMAGE_STAT = {
    id: EStat.RECEIVED_WEAPON_DAMAGE,
    name: "Received Weapon Damage",
} satisfies TStatEffect["stat"];

export const RED_COLOR = { name: "Red" } satisfies TDamageEffect["color"];
export const BLUE_COLOR = { name: "Blue" } satisfies TDamageEffect["color"];
export const COLORLESS_COLOR = { name: "Colorless" } satisfies TDamageEffect["color"];

export const ANY_TARGET = { kind: ESpellEffectTarget.ANY, asString: "targets" } satisfies TSpellEffectTarget;
export const SELF_TARGET = { kind: ESpellEffectTarget.SELF, asString: "user" } satisfies TSpellEffectTarget;

export const INCREASE_STAT_CHANGE = {
    verb: "Increases",
    preposition: "by",
} satisfies TStatEffect["statChange"];

export const DECREASE_STAT_CHANGE = {
    verb: "Decreases",
    preposition: "by",
} satisfies TStatEffect["statChange"];

export const LIMIT_STAT_CHANGE = {
    verb: "Limits",
    preposition: "to",
} satisfies TStatEffect["statChange"];

export const FIXED_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.FIXED,
} satisfies TSpellEffectValueUnit;

export const HP_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: HP_STAT,
} satisfies TSpellEffectValueUnit;

export const ATK_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: ATK_STAT,
} satisfies TSpellEffectValueUnit;

export const RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: RECEIVED_WEAPON_DAMAGE_STAT,
} satisfies TSpellEffectValueUnit;
