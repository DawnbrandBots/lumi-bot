import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function clearLfgChannel(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string },
): Promise<TAdminResultTypes["clearLfgChannel"]> {
    await dependencies.persistence.clearLfgChannel(arg);
    return { kind: EAdminResultKind.LFG_CHANNEL_CLEARED };
}
