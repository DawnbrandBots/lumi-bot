import { staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import recreateStaticGameDataDb from "./utils/recreateStaticGameDataDb.ts";

await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
