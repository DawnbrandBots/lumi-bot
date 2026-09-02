import { migrationMikroOrmConfig } from "../src/infrastructure/wrappers/orm/mikroOrm/config.ts";
import migrateDb from "./utils/migrateDb.ts";

await migrateDb(migrationMikroOrmConfig);
