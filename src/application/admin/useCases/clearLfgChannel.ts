import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function clearLfgChannel(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminResultTypes["lfgChannel"]> {
    await persistence.clearLfgChannel({ guildId: guild });
    return { kind: EAdminResultKind.LFG_CHANNEL_CLEARED };
}
