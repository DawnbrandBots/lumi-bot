import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function clearLfgChannel(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminFeatureReturnTypes["lfgChannel"]> {
    await persistence.clearLfgChannel({ guildId: guild });
    return { kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED };
}
