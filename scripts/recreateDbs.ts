import { configsById } from "../src/mikro-orm.config.ts";
import recreateGameDb from "./utils/recreateGameDb.ts";
// import recreateLfgDb from "./utils/recreateLfgDb.ts";

await recreateGameDb(configsById.game);
// await recreateLfgDb(configsById.lfg);
