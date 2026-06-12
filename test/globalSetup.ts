/**
 * @file Referred to by vite.config.ts.
 */

import recreateStaticDbs from "../scripts/utils/recreateStaticDbs.ts";

export default async function () {
    await recreateStaticDbs();
}
