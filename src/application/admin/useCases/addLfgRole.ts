import { ADMIN_LFG_ROLE_LIMIT } from "../constants.ts";
import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const addLfgRole: TAdminUseCaseBase<
    "addLfgRole",
    "repositories.admin.listLfgRoles" | "repositories.admin.addLfgRole"
> = async function (dependencies, arg) {
    if (arg.roleId === arg.guildId) {
        return { kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE };
    }
    const roles = await dependencies.repositories.admin.listLfgRoles({ guildId: arg.guildId });
    if (roles.some((lfgRole) => lfgRole.role === arg.roleId)) {
        return { kind: EAdminResultKind.LFG_ROLE_ALREADY_EXISTS, value: { role: arg.roleId } };
    }
    if (roles.length >= ADMIN_LFG_ROLE_LIMIT) {
        return { kind: EAdminResultKind.LFG_ROLE_LIMIT_REACHED };
    }
    await dependencies.repositories.admin.addLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_ADDED,
        value: { role: arg.roleId },
    };
};
