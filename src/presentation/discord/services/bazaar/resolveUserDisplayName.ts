import type { Client } from "discord.js";

export async function resolveUserDisplayName(
    client: Pick<Client<true>, "users">,
    userId?: string,
): Promise<string | undefined> {
    if (!userId) {
        return undefined;
    }
    try {
        return (await client.users.fetch(userId)).displayName;
    } catch {
        return undefined;
    }
}
