import type { TAdminLfgRoleConfig } from "../../application/admin/types.ts";
import type { GuildConfigLfgRole } from "./models/configLfgRole.ts";

export function toAdminLfgRoleConfig(lfgRole: GuildConfigLfgRole): TAdminLfgRoleConfig {
    return {
        lastPingedAt: lfgRole.lastPingedAt ?? null,
        role: lfgRole.role,
    };
}
