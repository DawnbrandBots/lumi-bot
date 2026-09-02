import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const clearLfgRolePingCooldown: TAdminUseCaseBase<
    "clearLfgRolePingCooldown",
    "repositories.admin.clearLfgRolePingCooldown"
> = async function (dependencies, arg) {
    await dependencies.repositories.admin.clearLfgRolePingCooldown(arg);
    return { kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
};
