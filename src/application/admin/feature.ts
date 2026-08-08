import { addLfgRole } from "./addLfgRole.ts";
import { clearLfgChannel } from "./clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "./clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "./getGuildConfig.ts";
import { getLfgRoleConfig } from "./getLfgRoleConfig.ts";
import { removeLfgRole } from "./removeLfgRole.ts";
import { setLfgChannel } from "./setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "./setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "./setLfgRolePingCooldown.ts";
import type { TAdminFeature, TAdminPersistence } from "./types.ts";

export function getAdminFeature(persistence: TAdminPersistence): TAdminFeature {
    return {
        addLfgRole: (guild, role) => addLfgRole(persistence, guild, role),
        clearLfgChannel: (guild) => clearLfgChannel(persistence, guild),
        clearLfgRolePingCooldown: (guild) => clearLfgRolePingCooldown(persistence, guild),
        getGuildConfig: (guild) => getGuildConfig(persistence, guild),
        getLfgRoleConfig: (guild, role) => getLfgRoleConfig(persistence, guild, role),
        removeLfgRole: (guild, role) => removeLfgRole(persistence, guild, role),
        setLfgChannel: (guild, channel) => setLfgChannel(persistence, guild, channel),
        setLfgRoleLastPingedAt: (guild, role, date) => setLfgRoleLastPingedAt(persistence, guild, role, date),
        setLfgRolePingCooldown: (guild, minutes) => setLfgRolePingCooldown(persistence, guild, minutes),
    };
}
