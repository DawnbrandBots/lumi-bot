import { EAdminResultKind, type TAdminResultTypes } from "../types.ts";
import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function getLfgRoleConfig(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly roleId: string },
): Promise<TAdminResultTypes["getLfgRoleConfig"]> {
    const lfgRole = await dependencies.persistence.getLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
}
