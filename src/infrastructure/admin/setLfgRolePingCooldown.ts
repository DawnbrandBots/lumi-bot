import type { TAdminPersistenceMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const setLfgRolePingCooldown: TAdminPersistenceMap["setLfgRolePingCooldown"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgRolePingCooldownMinutes = arg.minutes;
    await context.em.flush();
};
