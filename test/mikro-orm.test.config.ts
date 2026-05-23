import { configsById as baseConfigsById } from "../src/mikro-orm.config.ts";

const TEST_DB_NAME = "game-test.db3";
export const configsById = { game: { ...baseConfigsById.game, dbName: TEST_DB_NAME } } as const;
