import type { TAdminRepositoryMap } from "./types.ts";
import { GuildConfigLfgRole } from "../../models/admin/configLfgRole.ts";

export const setLfgRoleLastPingedAt: TAdminRepositoryMap["setLfgRoleLastPingedAt"] = async (context, arg) => {
    const lfgRole = await context.em.findOne(GuildConfigLfgRole, {
        guildConfig: { guild: arg.guildId },
        role: arg.roleId,
    });
    if (!lfgRole) {
        return;
    }
    lfgRole.lastPingedAt = arg.date.toISOString();
};
