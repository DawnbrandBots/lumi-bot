import { toAdminLfgRoleConfig } from "../../mappers/toAdminLfgRoleConfig.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";
import type { TAdminPersistenceMap } from "./types.ts";

export const getLfgRole: TAdminPersistenceMap["getLfgRole"] = async (context, arg) => {
    const lfgRole = await context.em.findOne(GuildConfigLfgRole, {
        guildConfig: { guild: arg.guildId },
        role: arg.roleId,
    });
    return lfgRole && toAdminLfgRoleConfig(lfgRole);
};
