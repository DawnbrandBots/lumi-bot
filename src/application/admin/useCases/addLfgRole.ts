import { ADMIN_LFG_ROLE_LIMIT } from "../constants.ts";
import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function addLfgRole(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["addLfgRole"]> {
    if (arg.roleId === arg.guildId) {
        return { kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE };
    }
    const roles = await dependencies.persistence.admin.listLfgRoles({ guildId: arg.guildId });
    if (roles.some((lfgRole) => lfgRole.role === arg.roleId)) {
        return { kind: EAdminResultKind.LFG_ROLE_ALREADY_EXISTS, value: { role: arg.roleId } };
    }
    if (roles.length >= ADMIN_LFG_ROLE_LIMIT) {
        return { kind: EAdminResultKind.LFG_ROLE_LIMIT_REACHED };
    }
    await dependencies.persistence.admin.addLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_ADDED,
        value: { role: arg.roleId },
    };
}
