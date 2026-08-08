import type { TAdminPersistence } from "../../application/admin/types.ts";
import { addLfgRole } from "./addLfgRole.ts";
import { clearLfgChannel } from "./clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "./clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "./getGuildConfig.ts";
import { getLfgRole } from "./getLfgRole.ts";
import { listLfgRoles } from "./listLfgRoles.ts";
import { removeLfgRole } from "./removeLfgRole.ts";
import { setLfgChannel } from "./setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "./setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "./setLfgRolePingCooldown.ts";
import type { TAdminPersistenceContext } from "./types.ts";

export function getAdminPersistence(context: TAdminPersistenceContext): TAdminPersistence {
    return {
        addLfgRole: (arg) => addLfgRole(context, arg),
        clearLfgChannel: (arg) => clearLfgChannel(context, arg),
        clearLfgRolePingCooldown: (arg) => clearLfgRolePingCooldown(context, arg),
        getGuildConfig: (arg) => getGuildConfig(context, arg),
        getLfgRole: (arg) => getLfgRole(context, arg),
        listLfgRoles: (arg) => listLfgRoles(context, arg),
        removeLfgRole: (arg) => removeLfgRole(context, arg),
        setLfgChannel: (arg) => setLfgChannel(context, arg),
        setLfgRoleLastPingedAt: (arg) => setLfgRoleLastPingedAt(context, arg),
        setLfgRolePingCooldown: (arg) => setLfgRolePingCooldown(context, arg),
    };
}
