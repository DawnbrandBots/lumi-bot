import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function setLfgRolePingCooldown(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly minutes: number },
): Promise<TAdminResultTypes["lfgRolePingCooldown"]> {
    await persistence.setLfgRolePingCooldown(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
        value: { minutes: arg.minutes },
    };
}
