import type { TAdminPersistence } from "./types.ts";

export async function setLfgRoleLastPingedAt(
    persistence: TAdminPersistence,
    guild: string,
    role: string,
    date: Date,
): Promise<void> {
    await persistence.setLfgRoleLastPingedAt({ guildId: guild, roleId: role, date });
}
