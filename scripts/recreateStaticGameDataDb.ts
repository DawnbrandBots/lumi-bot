import { staticGameDataMikroOrmConfig } from "../src/infrastructure/wrappers/orm/mikroOrm/config.ts";
import recreateStaticGameDataDb from "./utils/recreateStaticGameDataDb.ts";

await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
