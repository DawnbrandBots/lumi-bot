import { staticGameDataMikroOrmConfig } from "../src/infrastructure/persistence/mikroOrm/config.ts";
import recreateStaticGameDataDb from "./utils/recreateStaticGameDataDb.ts";

await recreateStaticGameDataDb(staticGameDataMikroOrmConfig);
