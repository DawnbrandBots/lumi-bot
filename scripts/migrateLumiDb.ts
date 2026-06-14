import { migrationMikroOrmConfig } from "../src/mikro-orm.config.ts";
import migrateDb from "./utils/migrateDb.ts";

await migrateDb(migrationMikroOrmConfig);
