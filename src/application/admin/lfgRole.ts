import { ADMIN_ACTION_ADD, ADMIN_ACTION_REMOVE, ADMIN_LFG_ROLE_LIMIT } from "../../admin/constants.ts";
import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { AdminLfgRoleAction, TAdminPersistence } from "./types.ts";

export async function lfgRole(
    persistence: TAdminPersistence,
    guild: string,
    action: AdminLfgRoleAction | null,
    role: string | null,
): Promise<TAdminFeatureReturnTypes["lfgRole"]> {
    await persistence.getOrCreateGuildConfig({ guildId: guild });
    const roles = await persistence.listLfgRoles({ guildId: guild });

    if (!action && !role) {
        return {
            kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
            value: { roles: roles.map((lfgRole) => lfgRole.role) },
        };
    }

    if (action === ADMIN_ACTION_ADD && role) {
        if (role === guild) {
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE };
        }
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

    if (action === ADMIN_ACTION_REMOVE && role) {
        const lfgRole = roles.find((candidate) => candidate.role === role);
        if (!lfgRole) {
            return { kind: EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND, value: { role } };
        }
        await persistence.removeLfgRole({ guildId: guild, roleId: role });
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_REMOVED, value: { role } };
    }

    if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE };
    }

    return { kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS };
}
