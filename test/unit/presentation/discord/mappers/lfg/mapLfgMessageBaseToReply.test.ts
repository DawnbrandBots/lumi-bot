import { MessageFlags } from "discord.js";
import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import {
    mapLfgMessageBaseToInteractionReply,
    mapLfgResultToMessageBase,
} from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import { GUILD_CONFIG, PUBLIC_CHANNEL_ID, ROOM } from "./fixtures.ts";

describe(mapLfgMessageBaseToInteractionReply.name, () => {
    test("keeps positive messages public in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToInteractionReply({
            messageBase,
            channelId: PUBLIC_CHANNEL_ID,
            lfgChannelId: GUILD_CONFIG.lfgChannel,
        });

        expect(reply).toEqual(messageBase);
        expect(reply).not.toHaveProperty("flags");
    });

    test("makes positive messages ephemeral outside the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToInteractionReply({
            messageBase,
            channelId: "other-channel",
            lfgChannelId: GUILD_CONFIG.lfgChannel,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes positive messages ephemeral when no channel is configured", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToInteractionReply({
            messageBase,
            channelId: "other-channel",
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes non-positive messages ephemeral in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToInteractionReply({
            messageBase,
            channelId: PUBLIC_CHANNEL_ID,
            lfgChannelId: GUILD_CONFIG.lfgChannel,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("keeps a message public when displayToEveryone is true", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.ROOMS_LISTED, value: { guildConfig: null, rooms: [ROOM] } },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToInteractionReply({
            messageBase,
            channelId: PUBLIC_CHANNEL_ID,
            displayToEveryone: true,
            lfgChannelId: GUILD_CONFIG.lfgChannel,
        });

        expect(reply).not.toHaveProperty("flags");
    });
});
