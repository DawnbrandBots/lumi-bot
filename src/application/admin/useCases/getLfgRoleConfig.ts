import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function getLfgRoleConfig(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["getLfgRoleConfig"]> {
    const lfgRole = await persistence.getLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
}
