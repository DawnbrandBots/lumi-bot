/**
 * @file Referred to by vite.config.ts.
 */

import recreateStaticDbs from "../scripts/utils/recreateStaticDbs.ts";
import { staticGameDataMikroOrmConfig } from "./mikro-orm.test.config.ts";

export default async function () {
    await recreateStaticDbs(staticGameDataMikroOrmConfig);
}
