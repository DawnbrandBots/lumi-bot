import { appMikroOrmConfig, migrationMikroOrmConfig, staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import recreateDb from "./utils/recreateDb.ts";

await recreateDb({
    appConfig: appMikroOrmConfig,
    migrationConfig: migrationMikroOrmConfig,
    staticGameDataConfig: staticGameDataMikroOrmConfig,
});
