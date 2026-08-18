import type { TAdminPersistenceMap } from "./types.ts";
import { GuildConfigLfgRole } from "./models/configLfgRole.ts";

export const setLfgRoleLastPingedAt: TAdminPersistenceMap["setLfgRoleLastPingedAt"] = async (context, arg) => {
    const lfgRole = await context.em.findOne(GuildConfigLfgRole, {
        guildConfig: { guild: arg.guildId },
        role: arg.roleId,
    });
    if (!lfgRole) {
        return;
    }
    lfgRole.lastPingedAt = arg.date.toISOString();
};
