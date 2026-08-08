import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function setLfgRolePingCooldown(
    persistence: TAdminPersistence,
    guild: string,
    minutes: number,
): Promise<TAdminFeatureReturnTypes["lfgRolePingCooldown"]> {
    await persistence.setLfgRolePingCooldown({ guildId: guild, minutes });
    return {
        kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
        value: { minutes },
    };
}
