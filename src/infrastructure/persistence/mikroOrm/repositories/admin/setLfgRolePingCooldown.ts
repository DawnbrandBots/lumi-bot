import type { TAdminRepositoryMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const setLfgRolePingCooldown: TAdminRepositoryMap["setLfgRolePingCooldown"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgRolePingCooldownMinutes = arg.minutes;
};
