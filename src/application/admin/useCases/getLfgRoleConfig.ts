import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function getLfgRoleConfig(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
): Promise<TAdminResultTypes["getLfgRoleConfig"]> {
    const lfgRole = await persistence.getLfgRole({ guildId: guild, roleId: role });
    return {
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
}
