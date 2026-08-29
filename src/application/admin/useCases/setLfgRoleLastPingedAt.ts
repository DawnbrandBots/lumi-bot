import type { TAdminUseCaseBase } from "../types.ts";

// TODO: should this really not be returning anything?
export const setLfgRoleLastPingedAt: TAdminUseCaseBase<
    "setLfgRoleLastPingedAt",
    "persistence.admin.setLfgRoleLastPingedAt"
> = async function (dependencies, arg) {
    await dependencies.persistence.admin.setLfgRoleLastPingedAt(arg);
};
