import { EAdminFeatureReturnKind, type TAdminFeatureReturnTypes } from "../../admin/types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function getLfgRoleConfig(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
): Promise<TAdminFeatureReturnTypes["getLfgRoleConfig"]> {
    const lfgRole = await persistence.getLfgRole({ guildId: guild, roleId: role });
    return {
        kind: EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
}
