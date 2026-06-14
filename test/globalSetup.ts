/**
 * @file Referred to by vite.config.ts.
 */

import recreateDb from "../scripts/utils/recreateDb.ts";
import { appMikroOrmConfig } from "./mikro-orm.test.config.ts";

export default async function () {
    await recreateDb(appMikroOrmConfig);
}
