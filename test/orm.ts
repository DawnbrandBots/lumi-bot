import type { MikroORM } from "@mikro-orm/sqlite";
import getOrm from "../src/loaders/orm.ts";
import { appMikroOrmConfig, staticGameDataMikroOrmConfig } from "./mikro-orm.test.config.ts";

export function initTestOrm(): Promise<MikroORM> {
    return getOrm(appMikroOrmConfig);
}

export function initTestGameOrm(): Promise<MikroORM> {
    return getOrm(staticGameDataMikroOrmConfig);
}
