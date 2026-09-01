import { ESpellEffectValueUnitKind, EStat } from "../../../../src/game/types.ts";
import type { TSpellEffectDescriptionsInput } from "../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";

type TRootSpellEffect = TSpellEffectDescriptionsInput["effects"][number];
type TDamageEffect = Extract<TRootSpellEffect, { kind: "DAMAGE" }>;
type TSpellEffectValueUnit = TDamageEffect["amount"]["unit"];

export const SINGLE_TILE_SHAPE = {
    id: "1_TILE",
    name: "single space",
    isAoe: false,
} satisfies TSpellEffectDescriptionsInput["shape"];

export const CROSS_SHAPE = {
    id: "CROSS",
    name: "3x3 cross",
    isAoe: true,
} satisfies TSpellEffectDescriptionsInput["shape"];

export const RED_COLOR = { name: "Red" } satisfies TDamageEffect["color"];
export const BLUE_COLOR = { name: "Blue" } satisfies TDamageEffect["color"];
export const COLORLESS_COLOR = { name: "Colorless" } satisfies TDamageEffect["color"];

export const FIXED_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.FIXED,
} satisfies TSpellEffectValueUnit;

export const HP_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: EStat.HP,
} satisfies TSpellEffectValueUnit;

export const ATK_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: EStat.ATK,
} satisfies TSpellEffectValueUnit;

export const RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT = {
    kind: ESpellEffectValueUnitKind.PERCENT,
    stat: EStat.RECEIVED_WEAPON_DAMAGE,
} satisfies TSpellEffectValueUnit;
