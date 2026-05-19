import type { MikroORM } from "@mikro-orm/sqlite";
import getOrm from "../src/loaders/orm.ts";
import mikroOrmConfig from "./mikro-orm.test.config.ts";

export async function initTestOrm(): Promise<MikroORM> {
    return getOrm(mikroOrmConfig);
}
