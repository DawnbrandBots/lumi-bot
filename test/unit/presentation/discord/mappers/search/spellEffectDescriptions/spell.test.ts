/** @file Tests on {@link describeSpellEffects}. */

import { describe, expect, test } from "vitest";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../../../../src/domain/game/models/spellEffect.types.ts";
import { EStat } from "../../../../../../../src/domain/game/models/stat.types.ts";
import { EStatChange } from "../../../../../../../src/domain/game/models/statChange.types.ts";
import { describeSpellEffects } from "../../../../../../../src/presentation/discord/mappers/search/spellEffectDescriptions.ts";
import {
    ATK_PERCENT_VALUE_UNIT,
    CROSS_SHAPE,
    FIXED_VALUE_UNIT,
    HP_PERCENT_VALUE_UNIT,
    SINGLE_TILE_SHAPE,
} from "./utils.ts";

describe(describeSpellEffects.name, () => {
    test("orders effects and selects regular or inline rendering", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: null,
            cooldown: 5,
            shape: SINGLE_TILE_SHAPE,
            effects: [{ kind: ESpellEffectKind.WARP }, { kind: ESpellEffectKind.OBSTACLE, hp: { base: 50 } }],
        };

        expect(describeSpellEffects(spell)).toBe(
            ["1. Moves user to target tile.", "1. Summons an obstacle with 50 HP on a single space."].join("\n"),
        );
        expect(describeSpellEffects(spell, true)).toBe(
            "Moves user to target tile, summons an obstacle with 50 HP on a single space.",
        );
    });

    test("prefixes a countdown", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            countdown: 2,
            uses: null,
            cooldown: 5,
            shape: SINGLE_TILE_SHAPE,
            effects: [{ kind: ESpellEffectKind.WARP }],
        };

        expect(describeSpellEffects(spell)).toBe("After 2 seconds:\n1. Moves user to target tile.");
        expect(describeSpellEffects(spell, true)).toBe("After 2 seconds, moves user to target tile.");
    });

    test("appends properties with non-default values to inline descriptions", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: 1,
            cooldown: 3,
            onlyFor: { name: "Infantry" },
            shape: SINGLE_TILE_SHAPE,
            effects: [{ kind: ESpellEffectKind.WARP }],
        };

        expect(describeSpellEffects(spell)).toBe("1. Moves user to target tile.");
        expect(describeSpellEffects(spell, true)).toBe(
            "Moves user to target tile. (Uses: 1, Cooldown: 3, Usable only by Infantry units)",
        );
    });

    test("groups statuses which share a target", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: null,
            cooldown: 5,
            shape: CROSS_SHAPE,
            effects: [
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.ANY,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.HP,
                        statChange: EStatChange.INCREASE,
                        amount: {
                            base: 20,
                            unit: HP_PERCENT_VALUE_UNIT,
                        },
                        duration: null,
                    },
                },
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.ANY,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.ATK,
                        statChange: EStatChange.INCREASE,
                        amount: {
                            base: 30,
                            unit: ATK_PERCENT_VALUE_UNIT,
                        },
                        duration: null,
                    },
                },
            ],
        };

        expect(describeSpellEffects(spell)).toBe(
            [
                "Grants statuses to targets:",
                "1. Increases HP by 20% (permanent).",
                "1. Increases Atk by 30% (permanent).",
            ].join("\n"),
        );
        expect(describeSpellEffects(spell, true)).toBe(
            `Grants "increases HP by 20% (permanent), increases Atk by 30% (permanent)" to targets on a 3x3 cross.`,
        );
    });

    test("keeps statuses with different targets separate", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: null,
            cooldown: 5,
            shape: SINGLE_TILE_SHAPE,
            effects: [
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.ANY,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.HP,
                        statChange: EStatChange.INCREASE,
                        amount: { base: 10, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.SELF,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.ATK,
                        statChange: EStatChange.INCREASE,
                        amount: { base: 5, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
            ],
        };

        expect(describeSpellEffects(spell)).toBe(
            [
                `1. Grants "increases HP by 10 (permanent)" to targets.`,
                `1. Grants "increases Atk by 5 (permanent)" to user.`,
            ].join("\n"),
        );
    });

    test("keeps statuses with different shape overrides separate", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: null,
            cooldown: 5,
            shape: CROSS_SHAPE,
            effects: [
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.ANY,
                    shapeOverride: SINGLE_TILE_SHAPE,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.HP,
                        statChange: EStatChange.INCREASE,
                        amount: { base: 10, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
                {
                    kind: ESpellEffectKind.STATUS,
                    target: ESpellEffectTarget.ANY,
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: EStat.ATK,
                        statChange: EStatChange.INCREASE,
                        amount: { base: 5, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
            ],
        };

        expect(describeSpellEffects(spell)).toBe(
            [
                `1. Grants "increases HP by 10 (permanent)" to targets on a single space.`,
                `1. Grants "increases Atk by 5 (permanent)" to targets.`,
            ].join("\n"),
        );
    });
});
