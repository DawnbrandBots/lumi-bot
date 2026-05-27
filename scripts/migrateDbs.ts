import type { Options } from "@mikro-orm/sqlite";
import { MikroORM } from "@mikro-orm/sqlite";
import fs from "node:fs";
import path from "node:path";
import configs from "../src/mikro-orm.config.ts";

const migratableConfigs: Options[] = configs.filter((config) => config.migrations);

if (migratableConfigs.length === 0) {
    console.log("No configs with migrations found.");
    process.exit(0);
}

console.log(`Migrating ${migratableConfigs.length} configs: ${migratableConfigs.map((c) => c.contextName).join(", ")}`);
for (const config of migratableConfigs) {
    console.log(new Date(), `Migrating ${config.contextName}...`);
    if (config.dbName) {
        fs.mkdirSync(path.dirname(config.dbName), { recursive: true });
    }
    const orm = await MikroORM.init(config);
    await orm.migrator.up();
    console.log(new Date(), `Finished migrating ${config.contextName}.`);
}
