import { MikroORM, type Options } from "@mikro-orm/sqlite";

export function initOrm(config: Options) {
    return MikroORM.init(config);
}
