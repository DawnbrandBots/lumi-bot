import type { TAdminGuildConfig } from "../../../../application/admin/types.ts";
import type { GuildConfig } from "../models/admin/config.ts";
import { toAdminLfgRoleConfig } from "./toAdminLfgRoleConfig.ts";

export function toAdminGuildConfig(config: GuildConfig): TAdminGuildConfig {
    return {
        lfgChannel: config.lfgChannel ?? null,
        lfgRolePingCooldownMinutes: config.lfgRolePingCooldownMinutes ?? null,
        lfgRoles: config.lfgRoles.getItems().map(toAdminLfgRoleConfig),
    };
}
