import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function removeLfgRole(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["lfgRole"]> {
    const lfgRole = await dependencies.persistence.getLfgRole(arg);
    if (!lfgRole) {
        return { kind: EAdminResultKind.LFG_ROLE_NOT_FOUND, value: { role: arg.roleId } };
    }
    await dependencies.persistence.removeLfgRole(arg);
    return { kind: EAdminResultKind.LFG_ROLE_REMOVED, value: { role: arg.roleId } };
}
