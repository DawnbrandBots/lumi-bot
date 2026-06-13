/**
 * @file Referred to by vite.config.ts.
 */

import mikroOrmConfig, { migrationMikroOrmConfig, staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import recreateDb from "../scripts/utils/recreateDb.ts";

export default async function () {
    await recreateDb({
        appConfig: mikroOrmConfig,
        migrationConfig: migrationMikroOrmConfig,
        staticGameDataConfig: staticGameDataMikroOrmConfig,
    });
}
