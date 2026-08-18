import type { TAdminPersistenceMap } from "./types.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";
import { toAdminLfgRoleConfig } from "./toAdminLfgRoleConfig.ts";

export const listLfgRoles: TAdminPersistenceMap["listLfgRoles"] = async (context, arg) => {
    const roles = await context.em.find(
        GuildConfigLfgRole,
        { guildConfig: { guild: arg.guildId } },
        { orderBy: { role: "asc" } },
    );
    return roles.map(toAdminLfgRoleConfig);
};
