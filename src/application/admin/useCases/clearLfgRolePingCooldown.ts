import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function clearLfgRolePingCooldown(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string },
): Promise<TAdminResultTypes["lfgRolePingCooldown"]> {
    await dependencies.persistence.clearLfgRolePingCooldown(arg);
    return { kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
}
