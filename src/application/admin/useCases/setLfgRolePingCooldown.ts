import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const setLfgRolePingCooldown: TAdminUseCaseBase<
    "setLfgRolePingCooldown",
    "persistence.admin.setLfgRolePingCooldown"
> = async function (dependencies, arg) {
    await dependencies.persistence.admin.setLfgRolePingCooldown(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
        value: { minutes: arg.minutes },
    };
};
