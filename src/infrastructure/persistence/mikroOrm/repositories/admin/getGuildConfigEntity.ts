import { GuildConfig } from "../../models/admin/config.ts";
import type { TAdminRepositoryContext } from "./types.ts";

export function getGuildConfigEntity(context: TAdminRepositoryContext, guildId: string): Promise<GuildConfig | null> {
    return context.em.findOne(GuildConfig, { guild: guildId }, { populate: ["lfgRoles"] });
}
