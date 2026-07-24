import type { Options } from "@mikro-orm/sqlite";

export default function getSameConfigInMemory<T extends Options>(config: T): T & { dbName: ":memory:" } {
    return {
        ...config,
        dbName: ":memory:",
    };
}
