import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function setLfgChannel(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly channelId: string },
): Promise<TAdminResultTypes["lfgChannel"]> {
    await persistence.setLfgChannel(arg);
    return {
        kind: EAdminResultKind.LFG_CHANNEL_SET,
        value: { channel: arg.channelId },
    };
}
