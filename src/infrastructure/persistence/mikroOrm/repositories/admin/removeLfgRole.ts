import type { TAdminPersistenceMap } from "./types.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";

export const removeLfgRole: TAdminPersistenceMap["removeLfgRole"] = async (context, arg) => {
    const lfgRole = await context.em.findOne(GuildConfigLfgRole, {
        guildConfig: { guild: arg.guildId },
        role: arg.roleId,
    });
    if (!lfgRole) {
        return;
    }
    context.em.remove(lfgRole);
};
