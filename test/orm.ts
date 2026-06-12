import type { MikroORM } from "@mikro-orm/sqlite";
import getOrm from "../src/loaders/orm.ts";
import { configsById } from "./mikro-orm.test.config.ts";

export function initTestGameOrm(): Promise<MikroORM> {
    return getOrm(configsById.game);
}
