import { ADMIN_LFG_ROLE_LIMIT } from "../constants.ts";
import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function addLfgRole(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["lfgRole"]> {
    if (arg.roleId === arg.guildId) {
        return { kind: EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE };
    }
    const roles = await persistence.listLfgRoles({ guildId: arg.guildId });
    if (roles.some((lfgRole) => lfgRole.role === arg.roleId)) {
        return { kind: EAdminResultKind.LFG_ROLE_ALREADY_EXISTS, value: { role: arg.roleId } };
    }
    if (roles.length >= ADMIN_LFG_ROLE_LIMIT) {
        return { kind: EAdminResultKind.LFG_ROLE_LIMIT_REACHED };
    }
    await persistence.addLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_ROLE_ADDED,
        value: { role: arg.roleId },
    };
}
