import { addLfgRole } from "./useCases/addLfgRole.ts";
import { clearLfgChannel } from "./useCases/clearLfgChannel.ts";
import { clearLfgRolePingCooldown } from "./useCases/clearLfgRolePingCooldown.ts";
import { getGuildConfig } from "./useCases/getGuildConfig.ts";
import { getLfgRoleConfig } from "./useCases/getLfgRoleConfig.ts";
import { removeLfgRole } from "./useCases/removeLfgRole.ts";
import { setLfgChannel } from "./useCases/setLfgChannel.ts";
import { setLfgRoleLastPingedAt } from "./useCases/setLfgRoleLastPingedAt.ts";
import { setLfgRolePingCooldown } from "./useCases/setLfgRolePingCooldown.ts";
export type { TAdminUseCases } from "./useCases.types.ts";

const USE_CASES = {
    addLfgRole,
    clearLfgChannel,
    clearLfgRolePingCooldown,
    getGuildConfig,
    getLfgRoleConfig,
    removeLfgRole,
    setLfgChannel,
    setLfgRoleLastPingedAt,
    setLfgRolePingCooldown,
};
export default USE_CASES;
