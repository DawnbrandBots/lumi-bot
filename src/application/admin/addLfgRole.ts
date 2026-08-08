import { ADMIN_LFG_ROLE_LIMIT } from "./constants.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function addLfgRole(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
): Promise<TAdminFeatureReturnTypes["lfgRole"]> {
    if (role === guild) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE };
    }
    const roles = await persistence.listLfgRoles({ guildId: guild });
    if (roles.some((lfgRole) => lfgRole.role === role)) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS, value: { role } };
    }
    if (roles.length >= ADMIN_LFG_ROLE_LIMIT) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED };
    }
    await persistence.addLfgRole({ guildId: guild, roleId: role });
    return {
        kind: EAdminFeatureReturnKind.LFG_ROLE_ADDED,
        value: { role },
    };
}
