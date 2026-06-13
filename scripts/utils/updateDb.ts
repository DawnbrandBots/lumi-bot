import type { Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import path from "node:path";
import migrateDb from "./migrateDb.ts";
import refreshStaticGameData, { ensureStaticGameDataSchema } from "./refreshStaticGameData.ts";

function ensureDbDirectories(configs: Options[]): void {
    for (const config of configs) {
        if (config.dbName) {
            fs.mkdirSync(path.dirname(config.dbName), { recursive: true });
        }
        for (const attachedDatabase of config.attachDatabases ?? []) {
            fs.mkdirSync(path.dirname(attachedDatabase.path), { recursive: true });
        }
    }
}

function deleteAttachedDatabases(config: Options): void {
    for (const attachedDatabase of config.attachDatabases ?? []) {
        if (fs.existsSync(attachedDatabase.path)) {
            fs.unlinkSync(attachedDatabase.path);
        }
    }
}

export default async function updateDb({
    appConfig,
    migrationConfig,
    staticGameDataConfig,
}: {
    readonly appConfig: Options;
    readonly migrationConfig: Options;
    readonly staticGameDataConfig: Options;
}): Promise<void> {
    if (!appConfig.dbName) {
        throw new Error("dbName required");
    }

    ensureDbDirectories([appConfig, migrationConfig, staticGameDataConfig]);
    deleteAttachedDatabases(staticGameDataConfig);
    await ensureStaticGameDataSchema(staticGameDataConfig);
    await migrateDb(migrationConfig);
    await refreshStaticGameData(staticGameDataConfig, { ensureSchema: false });
}
