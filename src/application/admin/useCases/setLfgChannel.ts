import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function setLfgChannel(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly channelId: string },
): Promise<TAdminResultTypes["setLfgChannel"]> {
    await dependencies.persistence.admin.setLfgChannel(arg);
    return {
        kind: EAdminResultKind.LFG_CHANNEL_SET,
        value: { channel: arg.channelId },
    };
}
