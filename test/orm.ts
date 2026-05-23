import type { MikroORM } from "@mikro-orm/sqlite";
import getOrm from "../src/loaders/orm.ts";
import { configsById } from "./mikro-orm.test.config.ts";

export function initTestOrm(): Promise<MikroORM> {
    return getOrm(configsById.game);
}

export function initTestLfgOrm(): Promise<MikroORM> {
    return getOrm(configsById.lfg);
}
