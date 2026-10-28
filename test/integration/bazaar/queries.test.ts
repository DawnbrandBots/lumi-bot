import { type EntityManager, type MikroORM } from "@mikro-orm/sqlite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { composeQueries } from "../../../src/composition/infrastructure/queries.ts";
import { Disciple } from "../../../src/infrastructure/persistence/mikroOrm/models/game/disciple.ts";
import { Weapon } from "../../../src/infrastructure/persistence/mikroOrm/models/game/weapon.ts";
import { initTestGameOrm } from "../../utils/orm.ts";
import { EMPTY_SEARCH_ENGINE } from "../../utils/searchEngine.ts";

describe("Bazaar queries", () => {
    let orm: MikroORM;
    let em: EntityManager;

    beforeAll(async () => {
        orm = await initTestGameOrm();
        em = orm.em.fork();
    });

    afterAll(async () => {
        await orm.close();
    });

    test("finds a structurally compatible disciple", async () => {
        const disciple = await em.findOneOrFail(Disciple, { isBattlePassDisciple: true });
        const queries = composeQueries({ em, searchEngine: EMPTY_SEARCH_ENGINE });

        await expect(queries.bazaar.findDiscipleById({ discipleId: disciple.id })).resolves.toMatchObject({
            id: disciple.id,
            isBattlePassDisciple: true,
            name: disciple.name,
        });
    });

    test("finds a structurally compatible weapon", async () => {
        const weapon = await em.findOneOrFail(Weapon, { level: { $in: [4, 6, 7, 8] } });
        const queries = composeQueries({ em, searchEngine: EMPTY_SEARCH_ENGINE });

        await expect(queries.bazaar.findWeaponById({ weaponId: weapon.id })).resolves.toMatchObject({
            id: weapon.id,
            level: weapon.level,
            name: weapon.name,
        });
    });

    test.each([
        [
            "disciple",
            () =>
                composeQueries({ em, searchEngine: EMPTY_SEARCH_ENGINE }).bazaar.findDiscipleById({
                    discipleId: "missing",
                }),
        ],
        [
            "weapon",
            () =>
                composeQueries({ em, searchEngine: EMPTY_SEARCH_ENGINE }).bazaar.findWeaponById({
                    weaponId: "missing",
                }),
        ],
    ] as const)("returns null for a missing %s", async (_kind, query) => {
        await expect(query()).resolves.toBeNull();
    });
});
