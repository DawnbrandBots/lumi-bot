import { getGuildConfig } from "./getGuildConfig.ts";
import { getLfgRoleConfig } from "./getLfgRoleConfig.ts";
import { lfgChannel } from "./lfgChannel.ts";
import { lfgRole } from "./lfgRole.ts";
import { lfgRolePingCooldown } from "./lfgRolePingCooldown.ts";
import { setLfgRoleLastPingedAt } from "./setLfgRoleLastPingedAt.ts";
import type { TAdminFeature, TAdminPersistence } from "./types.ts";

export function getAdminFeature(persistence: TAdminPersistence): TAdminFeature {
    return {
        getGuildConfig: (guild) => getGuildConfig(persistence, guild),
        getLfgRoleConfig: (guild, role) => getLfgRoleConfig(persistence, guild, role),
        lfgChannel: (guild, action, channel) => lfgChannel(persistence, guild, action, channel),
        lfgRole: (guild, action, role) => lfgRole(persistence, guild, action, role),
        lfgRolePingCooldown: (guild, action, minutes) => lfgRolePingCooldown(persistence, guild, action, minutes),
        setLfgRoleLastPingedAt: (guild, role, date) => setLfgRoleLastPingedAt(persistence, guild, role, date),
    };
}
