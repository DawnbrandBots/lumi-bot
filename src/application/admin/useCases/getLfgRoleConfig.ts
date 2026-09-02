import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const getLfgRoleConfig: TAdminUseCaseBase<"getLfgRoleConfig", "repositories.admin.getLfgRole"> = async function (
    dependencies,
    arg,
) {
    const lfgRole = await dependencies.repositories.admin.getLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
};
