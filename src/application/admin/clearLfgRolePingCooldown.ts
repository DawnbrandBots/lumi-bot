import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function clearLfgRolePingCooldown(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]> {
    await persistence.clearLfgRolePingCooldown({ guildId: guild });
    return { kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
}
