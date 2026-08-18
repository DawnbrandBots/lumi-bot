import { channelMention, roleMention } from "discord.js";
import { describe, expect, test } from "vitest";
import { EAdminResultKind } from "../../../../../../src/application/admin/types.ts";
import mapAdminResultToMessage from "../../../../../../src/presentation/discord/mappers/admin.ts";
import { EMessageKind } from "../../../../../../src/presentation/discord/message.types.ts";
import { assertMessage, CHANNEL_ID, ROLE_ID } from "./fixtures.ts";

describe(mapAdminResultToMessage.name, () => {
    test("maps LFG channel set", () => {
        const message = assertMessage(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_CHANNEL_SET,
                value: { channel: CHANNEL_ID },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: `LFG messages will be posted in ${channelMention(CHANNEL_ID)}.`,
        });
    });

    test("maps LFG channel cleared", () => {
        const message = assertMessage(mapAdminResultToMessage({ kind: EAdminResultKind.LFG_CHANNEL_CLEARED }));

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: "LFG messages are now only visible by command users.",
        });
    });

    test("maps LFG config", () => {
        const message = assertMessage(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_GET_CONFIG,
                value: {
                    lfgChannel: CHANNEL_ID,
                    lfgRolePingCooldownMinutes: 45,
                    lfgRoles: [{ role: ROLE_ID, lastPingedAt: null }],
                },
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

    test("maps LFG role ping cooldown set", () => {
        const message = assertMessage(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET,
                value: { minutes: 45 },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: "LFG pingable roles can be pinged every 45 minutes.",
        });
    });

    test("maps LFG role added", () => {
        const message = assertMessage(
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_ROLE_ADDED,
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
            mapAdminResultToMessage({
                kind: EAdminResultKind.LFG_ROLE_REMOVED,
                value: { role: ROLE_ID },
            }),
        );

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            description: `${roleMention(ROLE_ID)} can no longer be pinged by \`\`\`\nlfg ping\n\`\`\`.`,
        });
    });
});
