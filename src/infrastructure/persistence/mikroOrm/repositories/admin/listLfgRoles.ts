import { toAdminLfgRoleConfig } from "../../mappers/toAdminLfgRoleConfig.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";
import type { TAdminRepositoryMap } from "./types.ts";

export const listLfgRoles: TAdminRepositoryMap["listLfgRoles"] = async (context, arg) => {
    const roles = await context.em.find(
        GuildConfigLfgRole,
        { guildConfig: { guild: arg.guildId } },
        { orderBy: { role: "asc" } },
    );
    return roles.map(toAdminLfgRoleConfig);
};
