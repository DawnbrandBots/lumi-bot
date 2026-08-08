import { ADMIN_ACTION_CLEAR, ADMIN_ACTION_SET } from "../../admin/constants.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { AdminLfgChannelAction, TAdminPersistence } from "./types.ts";

export async function lfgChannel(
    persistence: TAdminPersistence,
    guild: string,
    action: AdminLfgChannelAction | null,
    channel: string | null,
): Promise<TAdminFeatureReturnTypes["lfgChannel"]> {
    const config = await persistence.getOrCreateGuildConfig({ guildId: guild });

    if (!action && !channel) {
        return {
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_HELP,
            value: { channel: config.lfgChannel },
        };
    }

    if (action === ADMIN_ACTION_SET && channel) {
        await persistence.setLfgChannel({ guildId: guild, channelId: channel });
        return {
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
            value: { channel },
        };
    }

    if (action === ADMIN_ACTION_CLEAR && !channel) {
        await persistence.clearLfgChannel({ guildId: guild });
        return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED };
    }

    if (action === ADMIN_ACTION_SET && !channel) {
        return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL };
    }

    return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS };
}
