import type { Options } from "@mikro-orm/sqlite";
import configs from "../src/mikro-orm.config.ts";
import migrateDb from "./utils/migrateDb.ts";

const migratableConfigs: Options[] = configs.filter((config) => config.migrations);

if (migratableConfigs.length === 0) {
    console.log("No configs with migrations found.");
    process.exit(0);
}

console.log(`Migrating ${migratableConfigs.length} configs: ${migratableConfigs.map((c) => c.contextName).join(", ")}`);
for (const config of migratableConfigs) {
    console.log(new Date(), `Migrating ${config.contextName}...`);
    await migrateDb(config);
    console.log(new Date(), `Finished migrating ${config.contextName}.`);
}
