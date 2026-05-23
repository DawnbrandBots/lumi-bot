import { MikroORM, type Options } from "@mikro-orm/sqlite";
import fs from "node:fs";

/**
 * Creates an SQLite database with game data.
 */
export default async function recreateLfgDb(config: Options): Promise<void> {
    if (!config.dbName) {
        throw new Error("dbName required");
    }

    if (fs.existsSync(config.dbName)) {
        fs.unlinkSync(config.dbName);
    }

    const orm = await MikroORM.init(config);
    await orm.schema.create();
    await orm.close(true);
}
