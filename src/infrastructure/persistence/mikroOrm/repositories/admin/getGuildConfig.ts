import { toAdminGuildConfig } from "../../mappers/toAdminGuildConfig.ts";
import { getGuildConfigEntity } from "./getGuildConfigEntity.ts";
import type { TAdminPersistenceMap } from "./types.ts";

export const getGuildConfig: TAdminPersistenceMap["getGuildConfig"] = async (context, arg) => {
    const config = await getGuildConfigEntity(context, arg.guildId);
    return config && toAdminGuildConfig(config);
};
