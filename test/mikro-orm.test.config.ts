import { defineConfig } from "@mikro-orm/core";
import mikroOrmConfig from "../src/mikro-orm.config.ts";

export const TEST_DB_NAME = "lumi-test";
export default defineConfig({ ...mikroOrmConfig, dbName: TEST_DB_NAME });
