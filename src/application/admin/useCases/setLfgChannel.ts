import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function setLfgChannel(
    persistence: TAdminPersistence,
    guild: string,
    channel: string,
): Promise<TAdminResultTypes["lfgChannel"]> {
    await persistence.setLfgChannel({ guildId: guild, channelId: channel });
    return {
        kind: EAdminResultKind.LFG_CHANNEL_SET,
        value: { channel },
    };
}
