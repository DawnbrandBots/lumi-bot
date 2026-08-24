import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function setLfgRolePingCooldown(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly minutes: number },
): Promise<TAdminResultTypes["lfgRolePingCooldown"]> {
    await dependencies.persistence.setLfgRolePingCooldown(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
        value: { minutes: arg.minutes },
    };
}
