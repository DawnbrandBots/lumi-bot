import { staticGameDataMikroOrmConfig } from "../src/mikro-orm.config.ts";
import recreateStaticDbs from "./utils/recreateStaticDbs.ts";

await recreateStaticDbs(staticGameDataMikroOrmConfig);
