import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const clearLfgRolePingCooldown: TAdminUseCaseBase<
    "clearLfgRolePingCooldown",
    "persistence.admin.clearLfgRolePingCooldown"
> = async function (dependencies, arg) {
    await dependencies.persistence.admin.clearLfgRolePingCooldown(arg);
    return { kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED };
};
