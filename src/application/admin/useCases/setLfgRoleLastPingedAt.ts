import type { TAdminPersistence } from "../types.ts";

export async function setLfgRoleLastPingedAt(
    persistence: TAdminPersistence,
    arg: { readonly guildId: string; readonly roleId: string; readonly date: Date },
): Promise<void> {
    await persistence.setLfgRoleLastPingedAt(arg);
}
