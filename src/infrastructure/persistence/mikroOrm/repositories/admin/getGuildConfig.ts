import { toAdminGuildConfig } from "../../mappers/toAdminGuildConfig.ts";
import { getGuildConfigEntity } from "./getGuildConfigEntity.ts";
import type { TAdminRepositoryMap } from "./types.ts";

export const getGuildConfig: TAdminRepositoryMap["getGuildConfig"] = async (context, arg) => {
    const config = await getGuildConfigEntity(context, arg.guildId);
    return config && toAdminGuildConfig(config);
};
