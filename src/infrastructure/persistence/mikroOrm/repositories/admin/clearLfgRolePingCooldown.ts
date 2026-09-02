import type { TAdminRepositoryMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const clearLfgRolePingCooldown: TAdminRepositoryMap["clearLfgRolePingCooldown"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgRolePingCooldownMinutes = null;
};
