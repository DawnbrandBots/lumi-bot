import type { TAdminPersistenceMap } from "./types.ts";
import { getGuildConfigEntity } from "./getGuildConfigEntity.ts";
import { toAdminGuildConfig } from "./toAdminGuildConfig.ts";

export const getGuildConfig: TAdminPersistenceMap["getGuildConfig"] = async (context, arg) => {
    const config = await getGuildConfigEntity(context, arg.guildId);
    return config && toAdminGuildConfig(config);
};
