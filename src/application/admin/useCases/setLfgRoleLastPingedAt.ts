import type { TAdminUseCaseDependencies } from "../useCases.types.ts";

export async function setLfgRoleLastPingedAt(
    dependencies: TAdminUseCaseDependencies,
    arg: { readonly guildId: string; readonly roleId: string; readonly date: Date },
): Promise<void> {
    await dependencies.persistence.admin.setLfgRoleLastPingedAt(arg);
}
