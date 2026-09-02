import type { TAdminUseCaseBase } from "../types.ts";

// TODO: should this really not be returning anything?
export const setLfgRoleLastPingedAt: TAdminUseCaseBase<
    "setLfgRoleLastPingedAt",
    "repositories.admin.setLfgRoleLastPingedAt"
> = async function (dependencies, arg) {
    await dependencies.repositories.admin.setLfgRoleLastPingedAt(arg);
};
