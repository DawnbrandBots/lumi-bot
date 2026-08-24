import { MikroORM } from "@mikro-orm/sqlite";
import { afterEach, beforeEach } from "vitest";
import type { TAdminPersistence } from "../../../../src/application/admin/persistence.types.ts";
import ADMIN_USE_CASES from "../../../../src/application/admin/useCases.ts";
import type { TAdminUseCases } from "../../../../src/application/admin/useCases.types.ts";
import { getWithUnitOfWork } from "../../../../src/composition/application/unitOfWork.ts";
import {
    getPersistenceWithContext,
    getUseCasesWithUnitOfWork,
} from "../../../../src/composition/application/useCases.ts";
import { GuildConfig } from "../../../../src/infrastructure/database/mikroOrm/models/admin/config.ts";
import { GuildConfigLfgRole } from "../../../../src/infrastructure/database/mikroOrm/models/admin/configLfgRole.ts";
import ADMIN_REPOSITORIES from "../../../../src/infrastructure/database/mikroOrm/repositories/admin.ts";
import { migrationMikroOrmConfig } from "../../../mikro-orm.test.config.ts";
import getSameConfigInMemory from "../../../utils/getSameConfigInMemory.ts";

export const GUILD_ID = "guild-1";
export const CHANNEL_ID = "channel-1";
export const ROLE_ID = "role-1";
export const ROLE_LAST_PINGED_AT = new Date("2026-06-16T10:00:00.000Z");

export const GUILD_ARG = { guildId: GUILD_ID };
export const LFG_CHANNEL_ARG = { ...GUILD_ARG, channelId: CHANNEL_ID };
export const LFG_ROLE_ARG = { ...GUILD_ARG, roleId: ROLE_ID };
export const LFG_ROLE_LAST_PINGED_AT_ARG = { ...LFG_ROLE_ARG, date: ROLE_LAST_PINGED_AT };
export const LFG_ROLE_PING_COOLDOWN_ARG = { ...GUILD_ARG, minutes: 45 };

const config = getSameConfigInMemory(migrationMikroOrmConfig);

export function useAdminUseCases() {
    let orm: MikroORM;
    let useCases: TAdminUseCases;

    beforeEach(async () => {
        orm = await MikroORM.init(config);
        await orm.schema.create();
        const em = orm.em.fork();
        const withAdminUnitOfWork = getWithUnitOfWork({
            em,
            getDependencies: (em) =>
                getPersistenceWithContext<TAdminPersistence>({
                    em,
                    repositories: ADMIN_REPOSITORIES,
                }),
        });
        useCases = getUseCasesWithUnitOfWork<TAdminUseCases>({
            useCases: ADMIN_USE_CASES,
            withUnitOfWork: withAdminUnitOfWork,
        });
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
            orm.em.fork().find(GuildConfigLfgRole, { guildConfig: { guild: GUILD_ID } }, { orderBy: { role: "asc" } }),
    };
}
