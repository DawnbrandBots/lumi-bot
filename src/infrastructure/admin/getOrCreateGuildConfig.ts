import type { TAdminPersistenceMap } from "./types.ts";
import { getOrCreateGuildConfigEntity } from "./getOrCreateGuildConfigEntity.ts";
import { toAdminGuildConfig } from "./toAdminGuildConfig.ts";

export const getOrCreateGuildConfig: TAdminPersistenceMap["getOrCreateGuildConfig"] = async (context, arg) => {
    const config = await getOrCreateGuildConfigEntity(context, arg.guildId);
    return toAdminGuildConfig(config);
};
