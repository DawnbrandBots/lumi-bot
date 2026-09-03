import { migrationMikroOrmConfig } from "../src/infrastructure/persistence/mikroOrm/config.ts";
import migrateDb from "./utils/migrateDb.ts";

await migrateDb(migrationMikroOrmConfig);
