import { GuildConfig } from "./models/config.ts";
import type { TAdminPersistenceContext } from "./types.ts";

export function getGuildConfigEntity(context: TAdminPersistenceContext, guildId: string): Promise<GuildConfig | null> {
    return context.em.findOne(GuildConfig, { guild: guildId }, { populate: ["lfgRoles"] });
}
