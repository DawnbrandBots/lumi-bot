import type { EntityManager } from "@mikro-orm/core";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Spell } from "../../src/game/models/spell.ts";
import { describeSpellEffects } from "../../src/game/spellEffectDescriptions.ts";
import { initTestOrm } from "../orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
});

afterAll(async () => {
    await orm.close();
});

async function findSpell(name: string): Promise<Spell> {
    return em.findOneOrFail(Spell, { name }, { populate: ["*"] });
}

describe(describeSpellEffects.name, () => {
    [
        {
            name: "Elfire",
            explanation: "plain damage",
            expected: "1. Deals 60 Red damage to targets.",
            inlineExpected: "Deals 60 Red damage to targets (single tile).",
        },
        {
            name: "Dark Tetrafire",
            explanation: "countdown before damage",
            expected: "After 2 seconds:\n1. Deals 75 Red damage to targets.",
            inlineExpected: "After 2 seconds, deals 75 Red damage to targets (2x2 square).",
        },
        {
            name: "Self Mend",
            explanation: "single-tile self heal",
            expected: "1. Restores 80 HP to user.",
            inlineExpected: "Restores 80 HP to user.",
        },
        {
            name: "Self Cross Shield",
            explanation: "aoe self-targeted status",
            expected: `1. Grants "decreases Received Weapon Damage by 30% (3 turns)" to targets in shape centered on user.`,
            inlineExpected: `Grants "decreases Received Weapon Damage by 30% (3 turns)" to targets in 3x3 cross centered on user. (Cooldown: 1)`,
        },
        {
            name: "Trinity Shield Edge EX",
            explanation: "shared status intro",
            expected: [
                "Grants statuses (permanent) to targets:",
                "1. Decreases Received Weapon Damage by 20%.",
                "1. Increases Atk by 30%.",
                "1. Decreases Color Affinity by 20%.",
            ].join("\n"),
            inlineExpected: [
                `Grants "decreases Received Weapon Damage by 20%`,
                `increases Atk by 30%`,
                `decreases Color Affinity by 20%" (permanent) to targets (3x3 cross). (Uses: 1, Cooldown: 1)`,
            ].join(", "),
        },
        {
            name: "Dark Crossfire + Tome",
            explanation: "countdown with shared status intro",
            expected: [
                "After 2 seconds:",
                `1. Inflicts "Deals 40 Red damage every 6 seconds (2 times)" to targets.`,
            ].join("\n"),
            inlineExpected: `After 2 seconds, inflicts "deals 40 Red damage every 6 seconds (2 times)" to targets (3x3 cross). (Cooldown: 4, Usable only by Tome units)`,
        },
        {
            name: "Thunder Self Edge EX",
            explanation: "mixed damage and status",
            expected: [
                "1. Deals 60 Blue damage to targets.",
                `1. Grants "increases Atk by 30% (permanent)" to user.`,
            ].join("\n"),
            inlineExpected: `Deals 60 Blue damage to targets (single tile), grants "increases Atk by 30% (permanent)" to user.`,
        },
        {
            name: "Crosswind Grav EX",
            explanation: "limits stat status effect",
            expected: [
                "1. Deals 40 Green damage to targets.",
                "1. Inflicts status to targets: Limits Movement to 1 (permanent).",
            ].join("\n"),
            inlineExpected: `Deals 40 Green damage to targets (3x3 cross), inflicts "limits Movement to 1 (permanent)" to targets (3x3 cross).`,
        },
        {
            name: "Dual Invigorate EX",
            explanation: "dual spell",
            expected: [
                `1. Grants "increases HP by 10% (permanent)" to user and targets.`,
                "1. Restores 10 HP to user and targets.",
            ].join("\n"),
            inlineExpected: `Grants "increases HP by 10% (permanent)" to user and targets, restores 10 HP to user and targets. (Uses: 1, Cooldown: 1)`,
        },
        {
            name: "Axe Fighter + Infantry",
            explanation: "summon",
            expected: "1. Summons Axe Infantry minion with 75 HP and 60 Atk.",
            inlineExpected:
                "Summons Axe Infantry minion with 75 HP and 60 Atk. (Uses: 1, Cooldown: 1, Usable only by Infantry units)",
        },
        {
            name: "Heal Warp EX",
            explanation: "warp",
            expected: ["1. Restores 50 HP to targets.", "1. Moves user to target tile."].join("\n"),
            inlineExpected: "Restores 50 HP to targets (single tile), moves user to target tile.",
        },
        {
            name: "Tetrathunder Wall EX",
            explanation: "ice blocks",
            expected: [
                "1. Inflicts status to targets: Deals 40 Blue damage every 6 seconds (2 times).",
                "1. Summons ice blocks with 60 HP.",
            ].join("\n"),
            inlineExpected: `Inflicts "deals 40 Blue damage every 6 seconds (2 times)" to targets (2x2 square), summons ice blocks with 60 HP. (Uses: 1)`,
        },
        {
            name: "Dark Cross Poison Patch",
            explanation: "tile",
            expected: `1. Applies "deals 25 Colorless damage every 3 seconds (5 times)" to target tiles.`,
            inlineExpected: `Applies "deals 25 Colorless damage every 3 seconds (5 times)" to target tiles. (Uses: 1)`,
        },
        {
            name: "Dark Offense + Armored",
            explanation: "inflict and grant",
            expected: `1. Inflicts "increase Received Weapon Damage by 100% (permanent)" and grants "increase Atk by 100% (permanent)" to targets (single tile).`,
            inlineExpected: `Inflicts "increase Received Weapon Damage by 100% (permanent)" and grants "increase Atk by 100% (permanent)" to targets (single tile). (Uses: 1)`,
        },
    ].forEach(({ name, explanation, expected, inlineExpected }) => {
        test(`${name} (${explanation})`, async () => {
            const spell = await findSpell(name);

            expect(describeSpellEffects(spell)).toBe(expected);
        });

        test(`${name} (${explanation}, inline)`, async () => {
            const spell = await findSpell(name);

            expect(describeSpellEffects(spell, true)).toBe(inlineExpected);
        });
    });
});
