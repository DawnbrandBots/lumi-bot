import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminPersistence } from "../types.ts";

export async function removeLfgRole(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["lfgRole"]> {
    const lfgRole = await persistence.getLfgRole(arg);
    if (!lfgRole) {
        return { kind: EAdminResultKind.LFG_ROLE_NOT_FOUND, value: { role: arg.roleId } };
    }
    await persistence.removeLfgRole(arg);
    return { kind: EAdminResultKind.LFG_ROLE_REMOVED, value: { role: arg.roleId } };
}
