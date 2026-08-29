import { EAdminResultKind, type TAdminUseCaseBase } from "../types.ts";

export const removeLfgRole: TAdminUseCaseBase<
    "removeLfgRole",
    "persistence.admin.getLfgRole" | "persistence.admin.removeLfgRole"
> = async function (dependencies, arg) {
    const lfgRole = await dependencies.persistence.admin.getLfgRole(arg);
    if (!lfgRole) {
        return { kind: EAdminResultKind.LFG_ROLE_NOT_FOUND, value: { role: arg.roleId } };
    }
    await dependencies.persistence.admin.removeLfgRole(arg);
    return { kind: EAdminResultKind.LFG_ROLE_REMOVED, value: { role: arg.roleId } };
};
