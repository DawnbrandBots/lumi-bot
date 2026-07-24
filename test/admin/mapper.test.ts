import { channelMention, MessageFlags, roleMention } from "discord.js";
import { describe, expect, test } from "vitest";
import mapAdminFeatureReturnToMessage from "../../src/admin/mapper.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import { EMessageKind } from "../../src/bot/types.ts";

const CHANNEL_ID = "channel-1";
const ROLE_ID = "role-1";

function assertMessage(message: ReturnType<typeof mapAdminFeatureReturnToMessage>) {
    expect(message).toBeDefined();
    return message;
}

function description(message: NonNullable<ReturnType<typeof mapAdminFeatureReturnToMessage>>): string {
    return message.embeds?.[0]?.description ?? "";
}

describe(mapAdminFeatureReturnToMessage.name, () => {
    test("maps LFG channel help", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_HELP,
                value: { channel: null },
            }),
        );

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("No channel set");
    });

    test("maps LFG channel set", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
                value: { channel: CHANNEL_ID },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: `LFG messages will be posted in ${channelMention(CHANNEL_ID)}.`,
        });
    });

    test("maps LFG channel cleared", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: "LFG messages are now only visible by command users.",
        });
    });

    test("maps LFG config", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
                value: {
                    guild: "guild-1",
                    lfgChannel: CHANNEL_ID,
                    lfgRolePingCooldownMinutes: 45,
                    lfgRoles: {
                        toArray: () => [{ role: ROLE_ID }],
                    },
                } as never,
            }),
        );

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.embeds?.[0]).toMatchObject({
            fields: [
                { name: "Channel", value: channelMention(CHANNEL_ID) },
                { name: "Roles", value: roleMention(ROLE_ID) },
                { name: "Role ping cooldown", value: "45 minutes" },
            ],
        });
    });

    test("maps LFG role ping cooldown help", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_HELP,
                value: { minutes: 45 },
            }),
        );

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("45 minutes");
    });

    test("maps LFG role ping cooldown set", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_PING_COOLDOWN_SET,
                value: { minutes: 45 },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: "LFG pingable roles can be pinged every 45 minutes.",
        });
    });

    test("maps LFG role help", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
                value: { roles: [] },
            }),
        );

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("No pingable role set");
    });

    test("maps LFG role added", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_ADDED,
                value: { role: ROLE_ID },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: `${roleMention(ROLE_ID)} can now be pinged by \`lfg ping\`.`,
        });
    });

    test("maps LFG role removed", () => {
        const message = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_REMOVED,
                value: { role: ROLE_ID },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: `${roleMention(ROLE_ID)} can no longer be pinged by \`\`\`\nlfg ping\n\`\`\`.`,
        });
    });

    test("maps invalid LFG channel options", () => {
        const missingChannel = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL,
            }),
        );
        const invalidOptions = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS,
            }),
        );
        const missingRole = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE,
            }),
        );
        const invalidRoleOptions = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS,
            }),
        );
        const everyoneRole = assertMessage(
            mapAdminFeatureReturnToMessage({
                kind: EAdminFeatureReturnKind.LFG_ROLE_CANNOT_BE_EVERYONE,
            }),
        );

        expect(missingChannel.kind).toBe(EMessageKind.ERROR);
        expect(missingChannel.embeds?.[0]).toMatchObject({ description: "Missing channel" });
        expect(invalidOptions.kind).toBe(EMessageKind.ERROR);
        expect(invalidOptions.embeds?.[0]).toMatchObject({ description: "Invalid options" });
        expect(missingRole.kind).toBe(EMessageKind.ERROR);
        expect(missingRole.embeds?.[0]).toMatchObject({ description: "Missing role" });
        expect(invalidRoleOptions.kind).toBe(EMessageKind.ERROR);
        expect(invalidRoleOptions.embeds?.[0]).toMatchObject({ description: "Invalid options" });
        expect(everyoneRole.kind).toBe(EMessageKind.ERROR);
        expect(everyoneRole.embeds?.[0]).toMatchObject({
            description: "`@everyone` cannot be configured as an LFG pingable role.",
        });
    });
});
