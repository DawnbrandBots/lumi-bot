import type { EntityManager } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Disciple } from "../../../src/game/models/disciple.ts";
import { getDiscipleBaseStatsTable } from "../../../src/search/handlers/disciple.ts";
import { initTestOrm } from "../../orm.ts";

let orm: Awaited<ReturnType<typeof initTestOrm>>;
let em: EntityManager;

beforeAll(async () => {
    orm = await initTestOrm();
    em = orm.em.fork();
});

afterAll(async () => {
    await orm.close();
});

describe(getDiscipleBaseStatsTable.name, () => {
    test("returns expected base stats for Kurt", async () => {
        const disciple = await em.findOneOrFail(Disciple, { id: "KURT" }, { populate: ["movementType", "weaponType"] });

        expect(getDiscipleBaseStatsTable(disciple)).toEqual([
            ["Level", 1, 8, 9, 10, 11],
            ["HP", 80, 136, 144, 152, 160],
            ["Atk", 42, 71, 75, 79, 84],
        ]);
    });
});
