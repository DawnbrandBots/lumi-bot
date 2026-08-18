import { migrationMikroOrmConfig } from "../src/infrastructure/database/mikroOrm/config.ts";
import migrateDb from "./utils/migrateDb.ts";

await migrateDb(migrationMikroOrmConfig);
