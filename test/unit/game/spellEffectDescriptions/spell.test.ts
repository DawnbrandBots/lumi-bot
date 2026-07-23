import { describe, expect, test } from "vitest";
import { describeSpellEffects } from "../../../../src/game/spellEffectDescriptions.ts";
import { ESpellEffectKind, ESpellEffectTarget } from "../../../../src/game/types.ts";
import {
    ATK_PERCENT_VALUE_UNIT,
    ATK_STAT,
    CROSS_SHAPE,
    FIXED_VALUE_UNIT,
    HP_PERCENT_VALUE_UNIT,
    HP_STAT,
    INCREASE_STAT_CHANGE,
    SINGLE_TILE_SHAPE,
} from "./utils.ts";

describe(describeSpellEffects.name, () => {
    test("orders effects and selects regular or inline rendering", () => {
        const spell: Parameters<typeof describeSpellEffects>[0] = {
            uses: null,
            cooldown: 5,
            shape: SINGLE_TILE_SHAPE,
            effects: [{ kind: ESpellEffectKind.WARP }, { kind: ESpellEffectKind.ICE_BLOCK, hp: { base: 50 } }],
        };

        expect(describeSpellEffects(spell)).toBe(
            ["1. Moves user to target tile.", "1. Summons ice blocks with 50 HP."].join("\n"),
        );
        expect(describeSpellEffects(spell, true)).toBe("moves user to target tile, summons ice blocks with 50 HP.");
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
        expect(describeSpellEffects(spell, true)).toBe("after 2 seconds, moves user to target tile.");
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
            "moves user to target tile. (Uses: 1, Cooldown: 3, Usable only by Infantry units)",
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
                    target: { kind: ESpellEffectTarget.ANY, asString: "targets" },
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: HP_STAT,
                        statChange: INCREASE_STAT_CHANGE,
                        amount: {
                            base: 20,
                            unit: HP_PERCENT_VALUE_UNIT,
                        },
                        duration: null,
                    },
                },
                {
                    kind: ESpellEffectKind.STATUS,
                    target: { kind: ESpellEffectTarget.ANY, asString: "targets" },
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: ATK_STAT,
                        statChange: INCREASE_STAT_CHANGE,
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
            [
                "grants statuses to targets (3x3 cross): increases HP by 20% (permanent)",
                "increases Atk by 30% (permanent).",
            ].join(", "),
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
                    target: { kind: ESpellEffectTarget.ANY, asString: "targets" },
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: HP_STAT,
                        statChange: INCREASE_STAT_CHANGE,
                        amount: { base: 10, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
                {
                    kind: ESpellEffectKind.STATUS,
                    target: { kind: ESpellEffectTarget.SELF, asString: "user" },
                    effect: {
                        kind: ESpellEffectKind.STAT,
                        stat: ATK_STAT,
                        statChange: INCREASE_STAT_CHANGE,
                        amount: { base: 5, unit: FIXED_VALUE_UNIT },
                        duration: null,
                    },
                },
            ],
        };

        expect(describeSpellEffects(spell)).toBe(
            [
                "1. Grants status to targets: Increases HP by 10 (permanent).",
                "1. Grants status to user: Increases Atk by 5 (permanent).",
            ].join("\n"),
        );
    });
});
