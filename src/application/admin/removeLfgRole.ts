import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function removeLfgRole(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
): Promise<TAdminFeatureReturnTypes["lfgRole"]> {
    const lfgRole = await persistence.getLfgRole({ guildId: guild, roleId: role });
    if (!lfgRole) {
        return { kind: EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND, value: { role } };
    }
    await persistence.removeLfgRole({ guildId: guild, roleId: role });
    return { kind: EAdminFeatureReturnKind.LFG_ROLE_REMOVED, value: { role } };
}
