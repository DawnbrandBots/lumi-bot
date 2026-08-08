import { ADMIN_ACTION_CLEAR, ADMIN_ACTION_SET } from "../../admin/constants.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { AdminLfgRolePingCooldownAction, TAdminPersistence } from "./types.ts";

export async function lfgRolePingCooldown(
    persistence: TAdminPersistence,
    guild: string,
    action: AdminLfgRolePingCooldownAction | null,
    minutes: number | null,
): Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]> {
    const config = await persistence.getOrCreateGuildConfig({ guildId: guild });

    if (!action && minutes === null) {
        return {
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_HELP,
            value: { minutes: config.lfgRolePingCooldownMinutes },
        };
    }

    if (action === ADMIN_ACTION_SET && minutes !== null && minutes >= 0) {
        await persistence.setLfgRolePingCooldown({ guildId: guild, minutes });
        return {
            kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
            value: { minutes },
        };
    }

    if (action === ADMIN_ACTION_CLEAR && minutes === null) {
        await persistence.clearLfgRolePingCooldown({ guildId: guild });
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
    }

    if (action === ADMIN_ACTION_SET && minutes === null) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_MISSING_MINUTES };
    }

    return { kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_INVALID_OPTIONS };
}
