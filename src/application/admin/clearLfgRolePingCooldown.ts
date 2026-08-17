import { EAdminResultKind, type TAdminResultTypes } from "./types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function clearLfgRolePingCooldown(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminResultTypes["lfgRolePingCooldown"]> {
    await persistence.clearLfgRolePingCooldown({ guildId: guild });
    return { kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
}
