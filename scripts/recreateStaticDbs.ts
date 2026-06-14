import { staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import recreateStaticGameDataDb from "./utils/recreateStaticDbs.ts";

await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
