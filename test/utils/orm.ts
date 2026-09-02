import type { MikroORM } from "@mikro-orm/sqlite";
import { initOrm } from "../../src/infrastructure/persistence/mikroOrm/orm.ts";
import { appMikroOrmConfig, staticGameDataMikroOrmConfig } from "../mikro-orm.test.config.ts";

export function initTestOrm(): Promise<MikroORM> {
    return initOrm(appMikroOrmConfig);
}

export function initTestGameOrm(): Promise<MikroORM> {
    return initOrm(staticGameDataMikroOrmConfig);
}
