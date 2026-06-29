import { type APIEmbed, channelMention, MessageFlags } from "discord.js";
import { describe, expect, test } from "vitest";
import mapAdminFeatureReturnToMessage from "../../src/admin/mapper.ts";
import type { GuildConfig } from "../../src/admin/models/config.ts";
import { EAdminFeatureReturnKind } from "../../src/admin/types.ts";
import { EMessageKind } from "../../src/bot/types.ts";

const CHANNEL_ID = "channel-1";

function description(message: ReturnType<typeof mapAdminFeatureReturnToMessage>): string {
    return (message.embeds?.[0] as APIEmbed | undefined)?.description ?? "";
}

describe(mapAdminFeatureReturnToMessage.name, () => {
    test("maps LFG channel help", () => {
        const message = mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_HELP,
            value: { channel: null },
        });

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.flags).toEqual([MessageFlags.Ephemeral]);
        expect(description(message)).toContain("Valid combinations");
        expect(description(message)).toContain("No channel set");
    });

    test("maps LFG channel set", () => {
        const message = mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_SET,
            value: { channel: CHANNEL_ID },
        });

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({
            title: "LFG public channel set",
            description: `LFG messages will be posted in ${channelMention(CHANNEL_ID)}.`,
        });
    });

    test("maps LFG channel cleared", () => {
        const message = mapAdminFeatureReturnToMessage({ kind: EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED });

        expect(message.kind).toBe(EMessageKind.POSITIVE);
        expect(message.embeds?.[0]).toMatchObject({ title: "LFG public channel cleared" });
    });

    test("maps LFG config", () => {
        const message = mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_GET_CONFIG,
            value: { guild: "guild-1", lfgChannel: CHANNEL_ID } as GuildConfig,
        });

        expect(message.kind).toBe(EMessageKind.NEUTRAL);
        expect(message.embeds?.[0]).toMatchObject({
            title: "LFG config",
            fields: [{ name: "Channel", value: channelMention(CHANNEL_ID) }],
        });
    });

    test("maps invalid LFG channel options", () => {
        const missingChannel = mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL,
        });
        const invalidOptions = mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS,
        });

        expect(missingChannel.kind).toBe(EMessageKind.ERROR);
        expect(missingChannel.embeds?.[0]).toMatchObject({ title: "Missing channel" });
        expect(invalidOptions.kind).toBe(EMessageKind.ERROR);
        expect(invalidOptions.embeds?.[0]).toMatchObject({ title: "Invalid options" });
    });
});
