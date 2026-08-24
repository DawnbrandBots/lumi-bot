import type { TAdminPersistence } from "../../../../application/admin/persistence.types.ts";
import { addLfgRole } from "./admin/addLfgRole.ts";
import { clearLfgChannel } from "./admin/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "./admin/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "./admin/getGuildConfig.ts";
import { getLfgRole } from "./admin/getLfgRole.ts";
import { listLfgRoles } from "./admin/listLfgRoles.ts";
import { removeLfgRole } from "./admin/removeLfgRole.ts";
import { setLfgChannel } from "./admin/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "./admin/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "./admin/setLfgRolePingCooldown.ts";
import type { TAdminPersistenceFunction } from "./admin/types.ts";

const ADMIN: { [K in keyof TAdminPersistence]: TAdminPersistenceFunction<TAdminPersistence[K]> } = {
    addLfgRole,
    clearLfgChannel,
    clearLfgRolePingCooldown,
    getGuildConfig,
    getLfgRole,
    listLfgRoles,
    removeLfgRole,
    setLfgChannel,
    setLfgRoleLastPingedAt,
    setLfgRolePingCooldown,
};
export default ADMIN;
