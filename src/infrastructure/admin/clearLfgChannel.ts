import type { TAdminPersistenceMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const clearLfgChannel: TAdminPersistenceMap["clearLfgChannel"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgChannel = null;
};
