import { EAdminResultKind, type TAdminResultTypes } from "./types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function setLfgRolePingCooldown(
    persistence: TAdminPersistence,
    guild: string,
    minutes: number,
): Promise<TAdminResultTypes["lfgRolePingCooldown"]> {
    await persistence.setLfgRolePingCooldown({ guildId: guild, minutes });
    return {
        kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
        value: { minutes },
    };
}
