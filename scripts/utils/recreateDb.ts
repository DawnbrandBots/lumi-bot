import type { Options } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import fs from "node:fs";
import path from "node:path";

export default async function recreateDb(config: Options) {
    if (!config.dbName) {
        throw new Error("dbName required");
    }

    if (fs.existsSync(config.dbName)) {
        fs.unlinkSync(config.dbName);
    } else {
        fs.mkdirSync(path.dirname(config.dbName), { recursive: true });
    }

    const orm = await MikroORM.init(config);
    await orm.schema.create();
}
