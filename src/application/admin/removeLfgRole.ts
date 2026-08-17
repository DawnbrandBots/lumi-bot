import { EAdminResultKind, type TAdminResultTypes } from "./types.ts";
import type { TAdminPersistence } from "./types.ts";

export async function removeLfgRole(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
): Promise<TAdminResultTypes["lfgRole"]> {
    const lfgRole = await persistence.getLfgRole({ guildId: guild, roleId: role });
    if (!lfgRole) {
        return { kind: EAdminResultKind.LFG_ROLE_NOT_FOUND, value: { role } };
    }
    await persistence.removeLfgRole({ guildId: guild, roleId: role });
    return { kind: EAdminResultKind.LFG_ROLE_REMOVED, value: { role } };
}
