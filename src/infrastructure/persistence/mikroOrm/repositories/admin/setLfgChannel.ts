import type { TAdminRepositoryMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";

export const setLfgChannel: TAdminRepositoryMap["setLfgChannel"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    config.lfgChannel = arg.channelId;
};
