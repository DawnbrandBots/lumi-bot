import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function getGuildConfig(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminFeatureReturnTypes["getGuildConfig"]> {
    const config = await persistence.getGuildConfig({ guildId: guild });
    return {
        kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
        value: config,
    };
}
