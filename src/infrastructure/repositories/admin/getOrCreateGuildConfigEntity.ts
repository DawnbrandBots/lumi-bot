import { randomUUID } from "node:crypto";
import { GuildConfig } from "../../wrappers/orm/mikroOrm/models/admin/config.ts";
import type { TAdminPersistenceContext } from "./types.ts";
import { getGuildConfigEntity } from "./getGuildConfigEntity.ts";

export async function getOrCreateGuildConfigEntity(
    context: TAdminPersistenceContext,
    guildId: string,
): Promise<GuildConfig> {
    const config = await getGuildConfigEntity(context, guildId);
    if (config) {
        return config;
    }

    const newConfig = context.em.create(GuildConfig, {
        id: randomUUID(),
        guild: guildId,
        lfgChannel: null,
        lfgRolePingCooldownMinutes: null,
    });
    context.em.persist(newConfig);
    return newConfig;
}
