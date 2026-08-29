import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const getLfgRoleConfig: TAdminUseCaseBase<"getLfgRoleConfig", "persistence.admin.getLfgRole"> = async function (
    dependencies,
    arg,
) {
    const lfgRole = await dependencies.persistence.admin.getLfgRole(arg);
    return {
        kind: EAdminResultKind.LFG_GET_ROLE_CONFIG,
        value: lfgRole,
    };
};
