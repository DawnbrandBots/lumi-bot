import { MikroORM } from "@mikro-orm/core";
import fs from "node:fs";
import getOrm from "../src/loaders/orm.ts";
import mikroOrmConfig, { TEST_DB_NAME } from "./mikro-orm.test.config.ts";

export async function initTestOrm(): Promise<MikroORM> {
    if (!fs.existsSync(TEST_DB_NAME)) {
        throw new Error(`Missing ${TEST_DB_NAME}. Run "yarn test:db" before running Vitest directly.`);
    }
    return getOrm({ ...mikroOrmConfig, dbName: TEST_DB_NAME });
}
