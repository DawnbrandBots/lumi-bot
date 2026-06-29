import { configsById } from "../../src/mikro-orm.config.ts";
import recreateGameDb from "./recreateGameDb.ts";

export default async function recreateStaticDbs() {
    await recreateGameDb(configsById.game);
}
