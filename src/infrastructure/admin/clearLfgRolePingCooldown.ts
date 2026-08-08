import type { TAdminPersistenceMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const clearLfgRolePingCooldown: TAdminPersistenceMap["clearLfgRolePingCooldown"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgRolePingCooldownMinutes = null;
    await context.em.flush();
};
