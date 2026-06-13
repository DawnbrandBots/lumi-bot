import type { Options } from "@mikro-orm/sqlite";
import fs from "node:fs";
import path from "node:path";
import refreshStaticGameData, { ensureStaticGameDataSchema } from "./refreshStaticGameData.ts";

function ensureDbDirectories(config: Options): void {
    if (config.dbName) {
        fs.mkdirSync(path.dirname(config.dbName), { recursive: true });
    }
    for (const attachedDatabase of config.attachDatabases ?? []) {
        fs.mkdirSync(path.dirname(attachedDatabase.path), { recursive: true });
    }
}

function deleteAttachedDatabases(config: Options): void {
    for (const attachedDatabase of config.attachDatabases ?? []) {
        if (fs.existsSync(attachedDatabase.path)) {
            fs.unlinkSync(attachedDatabase.path);
        }
    }
}

export default async function recreateStaticDbs(staticGameDataConfig: Options): Promise<void> {
    ensureDbDirectories(staticGameDataConfig);
    deleteAttachedDatabases(staticGameDataConfig);
    await ensureStaticGameDataSchema(staticGameDataConfig);
    await refreshStaticGameData(staticGameDataConfig, { ensureSchema: false });
}
