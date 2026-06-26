import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Disciple } from "../src/game/models/disciple.ts";
import { Spell } from "../src/game/models/spell.ts";
import { SPELL_DRAGGING_MODE } from "../src/game/models/spellDraggingMode.ts";
import { Weapon } from "../src/game/models/weapon.ts";
import { describeSpellEffects } from "../src/game/spellEffectDescriptions.ts";
import { ESpellDraggingMode } from "../src/game/types.ts";
import { initTestOrm } from "./orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
});

afterAll(async () => {
    await orm.close();
});

async function findDisciple(name: string): Promise<Disciple> {
    return em.findOneOrFail(Disciple, { name }, { populate: ["movementType", "weaponType"] });
}

async function findSpell(name: string): Promise<Spell> {
    return em.findOneOrFail(Spell, { name }, { populate: ["*"] });
}

async function findWeapon(name: string): Promise<Weapon> {
    return em.findOneOrFail(Weapon, { name }, { populate: ["weaponType.weaponSkills"] });
}

describe(Disciple.name, () => {
    describe("stat methods", () => {
        test("return expected values from loaded movement and weapon types", async () => {
            const disciple = await findDisciple("Kurt");

            expect(disciple.baseHp).toBe(80);
            expect(disciple.baseAtk).toBe(42);
            expect(disciple.getHp({ level: 11 })).toBe(160);
            expect(disciple.getAtk({ level: 11 })).toBe(84);
        });
    });
});

describe(Spell.name, () => {
    describe("draggingMode" satisfies keyof Spell, () => {
        test.each([
            ["Self Mend", SPELL_DRAGGING_MODE.SELF.kind],
            ["Thunder Self Edge EX", ESpellDraggingMode.ANY],
        ])("returns the expected mode for loaded spell %s", async (name, expected) => {
            const spell = await findSpell(name);

            expect(spell.draggingMode.kind).toBe(expected);
        });
    });

    describe(describeSpellEffects.name, () => {
        [
            {
                name: "Elfire",
                explanation: "plain damage",
                expected: "1. Deals 60 Red damage to targets.",
                inlineExpected: "deals 60 Red damage to targets (single tile).",
            },
            {
                name: "Dark Tetrafire",
                explanation: "countdown before damage",
                expected: "After 2 seconds:\n1. Deals 75 Red damage to targets.",
                inlineExpected: "after 2 seconds, deals 75 Red damage to targets (2x2 square).",
            },
            {
                name: "Self Mend",
                explanation: "single-tile self heal",
                expected: "1. Restores 80 HP to user.",
                inlineExpected: "restores 80 HP to user.",
            },
            {
                name: "Self Cross Shield",
                explanation: "aoe self-targeted status",
                expected:
                    "1. Grants status to targets in shape centered around user: Decreases Received Weapon Damage by 30% (3 turns).",
                inlineExpected:
                    "grants status to targets in 3x3 cross centered around user: decreases Received Weapon Damage by 30% (3 turns). (Cooldown: 1)",
            },
            {
                name: "Trinity Shield Edge EX",
                explanation: "shared status intro",
                expected: [
                    "Grants statuses to targets:",
                    "1. Decreases Received Weapon Damage by 20% (permanent).",
                    "1. Increases Atk by 30% (permanent).",
                    "1. Decreases Color Affinity by 20% (permanent).",
                ].join("\n"),
                inlineExpected: [
                    "grants statuses to targets (3x3 cross): decreases Received Weapon Damage by 20% (permanent)",
                    "increases Atk by 30% (permanent)",
                    "decreases Color Affinity by 20% (permanent). (Uses: 1, Cooldown: 1)",
                ].join(", "),
            },
            {
                name: "Dark Crossfire + Tome",
                explanation: "countdown with shared status intro",
                expected: [
                    "After 2 seconds:",
                    "1. Grants status to targets: Deals 40 Red damage every 6 seconds (2 times).",
                ].join("\n"),
                inlineExpected:
                    "after 2 seconds, grants status to targets (3x3 cross): deals 40 Red damage every 6 seconds (2 times). (Cooldown: 4, Usable only by Tome units)",
            },
            {
                name: "Thunder Self Edge EX",
                explanation: "mixed damage and status",
                expected: [
                    "1. Deals 60 Blue damage to targets.",
                    "1. Grants status to user: Increases Atk by 30% (permanent).",
                ].join("\n"),
                inlineExpected:
                    "deals 60 Blue damage to targets (single tile), grants status to user: increases Atk by 30% (permanent).",
            },
            {
                name: "Crosswind Grav EX",
                explanation: "limits stat status effect",
                expected: [
                    "1. Deals 40 Green damage to targets.",
                    "1. Grants status to targets: Limits Movement to 1 (permanent).",
                ].join("\n"),
                inlineExpected:
                    "deals 40 Green damage to targets (3x3 cross), grants status to targets (3x3 cross): limits Movement to 1 (permanent).",
            },
            {
                name: "Dual Invigorate EX",
                explanation: "dual spell",
                expected: [
                    "1. Grants status to user and targets: Increases HP by 10% (permanent).",
                    "1. Restores 10 HP to user and targets.",
                ].join("\n"),
                inlineExpected:
                    "grants status to user and targets: increases HP by 10% (permanent), restores 10 HP to user and targets. (Uses: 1, Cooldown: 1)",
            },
            {
                name: "Axe Fighter + Infantry",
                explanation: "summon",
                expected: "1. Summons Axe Infantry minion with 75 HP and 60 Atk.",
                inlineExpected:
                    "summons Axe Infantry minion with 75 HP and 60 Atk. (Uses: 1, Cooldown: 1, Usable only by Infantry units)",
            },
            {
                name: "Heal Warp EX",
                explanation: "warp",
                expected: ["1. Restores 50 HP to targets.", "1. Moves user to target tile."].join("\n"),
                inlineExpected: "restores 50 HP to targets (single tile), moves user to target tile.",
            },
            {
                name: "Tetrathunder Wall EX",
                explanation: "ice blocks",
                expected: [
                    "1. Grants status to targets: Deals 40 Blue damage every 6 seconds (2 times).",
                    "1. Summons ice blocks with 60 HP.",
                ].join("\n"),
                inlineExpected:
                    "grants status to targets (2x2 square): deals 40 Blue damage every 6 seconds (2 times), summons ice blocks with 60 HP. (Uses: 1)",
            },
            {
                name: "Dark Cross Poison Patch",
                explanation: "tile",
                expected: "1. Grants effect to target tiles: Deals 25 Colorless damage every 3 seconds (5 times).",
                inlineExpected:
                    "grants effect to target tiles (3x3 cross): deals 25 Colorless damage every 3 seconds (5 times). (Uses: 1)",
            },
            {
                name: "Slow Self Shield EX",
                explanation: "cooldown increasing spell effect",
                expected: [
                    "1. Grants status to targets: Increases Cooldown by 10% (3 turns).",
                    "1. Grants status to user: Decreases Received Weapon Damage by 25% (permanent).",
                ].join("\n"),
                inlineExpected: [
                    "grants status to targets (single tile): increases Cooldown by 10% (3 turns)",
                    "grants status to user: decreases Received Weapon Damage by 25% (permanent). (Uses: 1, Cooldown: 1)",
                ].join(", "),
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
});

describe(Weapon.name, () => {
    test("rule methods use loaded weapon and weapon type data", async () => {
        const royalSword = await findWeapon("Royal Sword +");
        const ironBow = await findWeapon("Iron Bow");

        expect(royalSword.getWeaponVariantStat({ variant: "NEUTRAL", stat: "hp" })).toBe(11);
        expect(ironBow.weaponTypeSkill?.id).toBe("FLIER_BANE_1");
    });
});
