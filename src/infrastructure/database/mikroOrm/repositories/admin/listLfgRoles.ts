import { toAdminLfgRoleConfig } from "../../mappers/toAdminLfgRoleConfig.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";
import type { TAdminPersistenceMap } from "./types.ts";

export const listLfgRoles: TAdminPersistenceMap["listLfgRoles"] = async (context, arg) => {
    const roles = await context.em.find(
        GuildConfigLfgRole,
        { guildConfig: { guild: arg.guildId } },
        { orderBy: { role: "asc" } },
    );
    return roles.map(toAdminLfgRoleConfig);
};
