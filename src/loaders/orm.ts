import { MikroORM } from "@mikro-orm/core";

export default function getOrm(config: Parameters<typeof MikroORM.init>[0]) {
    return MikroORM.init(config);
}
