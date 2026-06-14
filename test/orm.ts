import type { MikroORM } from "@mikro-orm/sqlite";
import getOrm from "../src/loaders/orm.ts";
import { staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import mikroOrmConfig from "./mikro-orm.test.config.ts";

export function initTestOrm(): Promise<MikroORM> {
    return getOrm(mikroOrmConfig);
}

export function initTestGameOrm(): Promise<MikroORM> {
    // TODO: re-export everything from mo.test.config.test
    return getOrm(staticGameDataMikroOrmConfig);
}
