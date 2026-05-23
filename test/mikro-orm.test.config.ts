import { configsById as baseConfigsById } from "../src/mikro-orm.config.ts";

const GAME_TEST_DB_NAME = "game-test.db3";
const LFG_TEST_DB_NAME = "lfg-test.db3";

export const configsById = {
    game: { ...baseConfigsById.game, dbName: GAME_TEST_DB_NAME },
    lfg: { ...baseConfigsById.lfg, dbName: LFG_TEST_DB_NAME },
} as const;
