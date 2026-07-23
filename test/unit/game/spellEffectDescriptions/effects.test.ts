import { describe, expect, test } from "vitest";
import { SPELL_EFFECT_DESCRIPTION_FORMATTERS } from "../../../../src/game/spellEffectDescriptions.ts";
import { ESpellEffectKind } from "../../../../src/game/types.ts";
import {
    ANY_TARGET,
    ATK_PERCENT_VALUE_UNIT,
    ATK_STAT,
    BLUE_COLOR,
    COLORLESS_COLOR,
    CROSS_SHAPE,
    DECREASE_STAT_CHANGE,
    FIXED_VALUE_UNIT,
    HP_STAT,
    LIMIT_STAT_CHANGE,
    RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT,
    RECEIVED_WEAPON_DAMAGE_STAT,
    RED_COLOR,
    SELF_TARGET,
    SINGLE_TILE_SHAPE,
} from "./utils.ts";

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE.name, () => {
    test("describes fixed damage, effectiveness and its target", () => {
        const effect: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE>[0] = {
            kind: ESpellEffectKind.DAMAGE,
            amount: {
                base: 60,
                unit: FIXED_VALUE_UNIT,
                effectiveness: [{ base: 90, kind: "Flying" }],
            },
            color: RED_COLOR,
            target: ANY_TARGET,
        };
        const spell: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE>[1] = {
            shape: SINGLE_TILE_SHAPE,
        };

        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(effect, spell, false)).toBe(
            "Deals 60 Red damage to targets (90 against Flying units)",
        );
        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(effect, spell, true)).toBe(
            "Deals 60 Red damage to targets (single tile) (90 against Flying units)",
        );
    });

    test("describes damage based on another stat", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.DAMAGE(
                {
                    kind: ESpellEffectKind.DAMAGE,
                    amount: {
                        base: 25,
                        unit: ATK_PERCENT_VALUE_UNIT,
                    },
                    color: BLUE_COLOR,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Deals (25% of Atk) Blue damage");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.HEAL.name, () => {
    test("describes healing effectiveness", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.HEAL(
                {
                    kind: ESpellEffectKind.HEAL,
                    amount: {
                        base: 40,
                        unit: FIXED_VALUE_UNIT,
                        effectiveness: [{ base: 70, kind: "Armored" }],
                    },
                    target: SELF_TARGET,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Restores 40 HP to user (70 for Armored units)");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.MOVEMENT.name, () => {
    test.each([
        [1, "tile"],
        [2, "tiles"],
    ])("pluralizes a movement of %i %s", (count, unit) => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.MOVEMENT(
                {
                    kind: ESpellEffectKind.MOVEMENT,
                    direction: { noun: "up" },
                    count,
                    target: ANY_TARGET,
                },
                { shape: CROSS_SHAPE },
                true,
            ),
        ).toBe(`Moves targets (3x3 cross) ${count} ${unit} up`);
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT.name, () => {
    test("describes a percentage of the affected stat and a duration", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(
                {
                    kind: ESpellEffectKind.STAT,
                    stat: ATK_STAT,
                    statChange: { verb: "Increases", preposition: "by" },
                    amount: {
                        base: 30,
                        unit: ATK_PERCENT_VALUE_UNIT,
                    },
                    duration: 3,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Increases Atk by 30% (3 turns)");
    });

    test("describes a permanent fixed stat change", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.STAT(
                {
                    kind: ESpellEffectKind.STAT,
                    stat: HP_STAT,
                    statChange: LIMIT_STAT_CHANGE,
                    amount: { base: 10, unit: FIXED_VALUE_UNIT },
                    duration: null,
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Limits HP to 10 (permanent)");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS.name, () => {
    test("describes a self-targeted status over an area", () => {
        const effect: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS>[0] = {
            kind: ESpellEffectKind.STATUS,
            target: SELF_TARGET,
            effect: {
                kind: ESpellEffectKind.STAT,
                stat: RECEIVED_WEAPON_DAMAGE_STAT,
                statChange: DECREASE_STAT_CHANGE,
                amount: {
                    base: 30,
                    unit: RECEIVED_WEAPON_DAMAGE_PERCENT_VALUE_UNIT,
                },
                duration: 3,
            },
        };
        const spell: Parameters<typeof SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS>[1] = {
            shape: CROSS_SHAPE,
        };

        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS(effect, spell, false)).toBe(
            "Grants status to targets in shape centered around user: Decreases Received Weapon Damage by 30% (3 turns)",
        );
        expect(SPELL_EFFECT_DESCRIPTION_FORMATTERS.STATUS(effect, spell, true)).toBe(
            "Grants status to targets in 3x3 cross centered around user: decreases Received Weapon Damage by 30% (3 turns)",
        );
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT.name, () => {
    test("describes its nested effect and schedule", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.REPEAT(
                {
                    kind: ESpellEffectKind.REPEAT,
                    effect: {
                        kind: ESpellEffectKind.DAMAGE,
                        amount: { base: 20, unit: FIXED_VALUE_UNIT },
                        color: RED_COLOR,
                    },
                    interval: 4,
                    times: 3,
                },
                { shape: SINGLE_TILE_SHAPE },
                true,
            ),
        ).toBe("deals 20 Red damage every 4 seconds (3 times)");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.WARP.name, () => {
    test("describes moving the user", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.WARP(
                { kind: ESpellEffectKind.WARP },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Moves user to target tile");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.ICE_BLOCK.name, () => {
    test("describes the summoned blocks' HP", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.ICE_BLOCK(
                {
                    kind: ESpellEffectKind.ICE_BLOCK,
                    hp: { base: 50 },
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Summons ice blocks with 50 HP");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.TILE.name, () => {
    test("describes a repeated effect on shaped tiles", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.TILE(
                {
                    kind: ESpellEffectKind.TILE,
                    target: ANY_TARGET,
                    repeat: {
                        kind: ESpellEffectKind.REPEAT,
                        effect: {
                            kind: ESpellEffectKind.DAMAGE,
                            amount: { base: 15, unit: FIXED_VALUE_UNIT },
                            color: COLORLESS_COLOR,
                        },
                        interval: 2,
                        times: 4,
                    },
                },
                { shape: CROSS_SHAPE },
                true,
            ),
        ).toBe("Grants effect to target tiles (3x3 cross): deals 15 Colorless damage every 2 seconds (4 times)");
    });
});

describe(SPELL_EFFECT_DESCRIPTION_FORMATTERS.SUMMON.name, () => {
    test("describes the summoned unit and stats", () => {
        expect(
            SPELL_EFFECT_DESCRIPTION_FORMATTERS.SUMMON(
                {
                    kind: ESpellEffectKind.SUMMON,
                    movementType: { name: "Infantry" },
                    weaponType: { name: "Axe" },
                    hp: { base: 75 },
                    atk: { base: 60 },
                },
                { shape: SINGLE_TILE_SHAPE },
                false,
            ),
        ).toBe("Summons Axe Infantry minion with 75 HP and 60 Atk");
    });
});
