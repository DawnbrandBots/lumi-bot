import { EAdminResultKind, type TAdminResultTypes } from "./types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function getGuildConfig(
    persistence: TAdminPersistence,
    guild: string,
): Promise<TAdminResultTypes["getGuildConfig"]> {
    const config = await persistence.getGuildConfig({ guildId: guild });
    return {
        kind: EAdminResultKind.LFG_GET_CONFIG,
        value: config,
    };
}
