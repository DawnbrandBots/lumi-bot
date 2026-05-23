import { configsById } from "../src/mikro-orm.config.ts";
import recreateGameDb from "./utils/recreateGameDb.ts";

await recreateGameDb(configsById.game);
