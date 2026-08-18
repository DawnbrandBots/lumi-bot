import { staticGameDataMikroOrmConfig } from "../src/infrastructure/database/mikroOrm/config.ts";
import recreateStaticGameDataDb from "./utils/recreateStaticGameDataDb.ts";

await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
