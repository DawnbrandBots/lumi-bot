import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import refreshStaticGameData from "../../scripts/utils/refreshStaticGameData.ts";
import { GAME_DB_SCHEMA } from "../../src/db/constants.ts";
import { Color } from "../../src/game/models/color.ts";

let tmpDir: string | null = null;

afterEach(() => {
    if (tmpDir) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        tmpDir = null;
    }
});

function getConfig() {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lumi-db-refresh-"));
    return defineConfig({
        entities: [Color],
        dbName: path.join(tmpDir, "state.db3"),
        attachDatabases: [{ name: GAME_DB_SCHEMA, path: path.join(tmpDir, "game.db3") }],
    });
}

describe(refreshStaticGameData.name, () => {
    test("updates static rows, deletes removed static rows, and preserves runtime tables", async () => {
        const config = getConfig();
        await refreshStaticGameData(config, {
            readEntries: () => [
                { id: "RED", name: "Red", strongAgainst: null, weakAgainst: null },
                { id: "BLUE", name: "Blue", strongAgainst: null, weakAgainst: null },
            ],
        });

        const orm = await MikroORM.init(config);
        try {
            await orm.em.getConnection().execute('CREATE TABLE "runtime_state" ("id" text primary key, "value" text)');
            await orm.em
                .getConnection()
                .execute('INSERT INTO "runtime_state" ("id", "value") VALUES (?, ?)', ["state", "preserved"]);
        } finally {
            await orm.close(true);
        }

        await refreshStaticGameData(config, {
            ensureSchema: false,
            readEntries: () => [{ id: "RED", name: "Updated Red", strongAgainst: null, weakAgainst: null }],
        });

        const updatedOrm = await MikroORM.init(config);
        try {
            const colors = await updatedOrm.em
                .getConnection()
                .execute(`SELECT "id", "name" FROM "${GAME_DB_SCHEMA}"."color" ORDER BY "id"`);
            const runtimeRows = await updatedOrm.em.getConnection().execute('SELECT "value" FROM "runtime_state"');

            expect(colors).toEqual([{ id: "RED", name: "Updated Red" }]);
            expect(runtimeRows).toEqual([{ value: "preserved" }]);
        } finally {
            await updatedOrm.close(true);
        }
    });
});
