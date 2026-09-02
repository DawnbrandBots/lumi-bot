import type { TAdminPersistenceMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const setLfgChannel: TAdminPersistenceMap["setLfgChannel"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgChannel = arg.channelId;
};
