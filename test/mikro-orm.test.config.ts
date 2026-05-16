import { defineConfig } from "@mikro-orm/sqlite";
import mikroOrmConfig from "../src/mikro-orm.config.ts";

const TEST_DB_NAME = "lumi-test";
export default defineConfig({ ...mikroOrmConfig, dbName: TEST_DB_NAME });
