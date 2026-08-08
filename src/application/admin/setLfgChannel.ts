import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function setLfgChannel(
    persistence: TAdminPersistence,
    guild: string,
    channel: string,
): Promise<TAdminFeatureReturnTypes["lfgChannel"]> {
    await persistence.setLfgChannel({ guildId: guild, channelId: channel });
    return {
        kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
        value: { channel },
    };
}
