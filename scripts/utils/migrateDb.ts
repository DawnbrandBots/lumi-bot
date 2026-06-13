import type { Options } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import fs from "node:fs";
import path from "node:path";

export default async function migrateDb(config: Options) {
    if (config.entities?.length === 0) {
        return;
    }

    if (config.dbName) {
        fs.mkdirSync(path.dirname(config.dbName), { recursive: true });
    }
    const orm = await MikroORM.init(config);
    try {
        await orm.migrator.up();
    } finally {
        await orm.close(true);
    }
}
