import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Disciple } from "../../../src/game/models/disciple.ts";
import { Spell } from "../../../src/game/models/spell.ts";
import { SPELL_DRAGGING_MODE } from "../../../src/game/models/spellDraggingMode.ts";
import { Weapon } from "../../../src/game/models/weapon.ts";
import { ESpellDraggingMode } from "../../../src/game/types.ts";
import { initTestOrm } from "../../support/orm.ts";

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
            expect(disciple.weaponType.discipleBaseAtkModifier).toBe(1);
        });
    });
});

describe(Spell.name, () => {
    test("loaded shape delegates its area check", async () => {
        const spell = await findSpell("Dark Tetrafire");

        expect(spell.shape.isAoe).toBe(true);
    });

    describe("draggingMode" satisfies keyof Spell, () => {
        test.each([
            ["Self Mend", SPELL_DRAGGING_MODE.SELF.kind],
            ["Thunder Self Edge EX", ESpellDraggingMode.ANY],
        ])("returns the expected mode for loaded spell %s", async (name, expected) => {
            const spell = await findSpell(name);

            expect(spell.draggingMode.kind).toBe(expected);
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
