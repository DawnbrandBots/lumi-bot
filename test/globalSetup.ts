/**
 * @file Referred to by vite.config.ts.
 */

import migrateDb from "../scripts/utils/migrateDb.ts";
import recreateStaticGameDataDb from "../scripts/utils/recreateStaticGameDataDb.ts";
import { migrationMikroOrmConfig, staticGameDataMikroOrmConfig } from "./mikro-orm.test.config.ts";

export default async function () {
    await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
    await migrateDb(migrationMikroOrmConfig);
}
