import mikroOrmConfig, { migrationMikroOrmConfig, staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import updateDb from "./utils/updateDb.ts";

await updateDb({
    appConfig: mikroOrmConfig,
    migrationConfig: migrationMikroOrmConfig,
    staticGameDataConfig: staticGameDataMikroOrmConfig,
});
