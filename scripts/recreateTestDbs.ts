/**
 * @file Creates an SQLite database with game data.
 *
 * Takes the path to mikro-orm.config.ts as argument.
 */

import { configsById } from "../test/mikro-orm.test.config.ts";
import recreateGameDb from "./utils/recreateGameDb.ts";

await recreateGameDb(configsById.game);
