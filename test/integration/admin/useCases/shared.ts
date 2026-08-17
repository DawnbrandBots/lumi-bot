import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import { composeAdminUseCases, type TAdminUseCases } from "../../../../src/composition/application/admin/useCases.ts";
import { GuildConfig } from "../../../../src/infrastructure/admin/models/config.ts";
import { GuildConfigLfgRole } from "../../../../src/infrastructure/admin/models/configLfgRole.ts";
import { migrationMikroOrmConfig } from "../../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../../utils/getSameConfigInMemory.ts";

export const GUILD_ID = "guild-1";
export const CHANNEL_ID = "channel-1";
export const ROLE_ID = "role-1";

const config = getSameConfigInMemory(migrationMikroOrmConfig);

export function useAdminUseCases() {
    let orm: MikroORM;
    let useCases: TAdminUseCases;

    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        useCases = composeAdminUseCases({ em: orm.em.fork() });
    });

    afterEach(async () => {
        await orm.close(true);
    });

    return {
        get useCases() {
            return useCases;
        },
        getStoredConfig: (): Promise<GuildConfig | null> => orm.em.fork().findOne(GuildConfig, { guild: GUILD_ID }),
        getStoredRoles: (): Promise<GuildConfigLfgRole[]> =>
            orm
                .em
                .fork()
                .find(GuildConfigLfgRole, { guildConfig: { guild: GUILD_ID } }, { orderBy: { role: "asc" } }),
    };
}
