import { MikroORM, type Options } from "@mikro-orm/sqlite";

export default function getOrm(config: Options) {
    return MikroORM.init(config);
}
