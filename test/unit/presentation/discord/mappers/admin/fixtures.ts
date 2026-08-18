import { expect } from "vitest";
import type mapAdminResultToMessage from "../../../../../../src/presentation/discord/mappers/admin.ts";

export const CHANNEL_ID = "channel-1";
export const ROLE_ID = "role-1";

export function assertMessage(message: ReturnType<typeof mapAdminResultToMessage>) {
    expect(message).toBeDefined();
    return message;
}

export function description(message: NonNullable<ReturnType<typeof mapAdminResultToMessage>>): string {
    return message.embeds?.[0]?.description ?? "";
}
