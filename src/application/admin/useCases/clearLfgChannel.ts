import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function clearLfgChannel(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string },
): Promise<TAdminResultTypes["lfgChannel"]> {
    await persistence.clearLfgChannel(arg);
    return { kind: EAdminResultKind.LFG_CHANNEL_CLEARED };
}
