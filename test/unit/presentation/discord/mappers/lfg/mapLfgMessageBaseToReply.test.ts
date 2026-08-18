import { MessageFlags } from "discord.js";
import { describe, expect, test } from "vitest";
import { ELfgResultKind } from "../../../../../../src/application/lfg/types.ts";
import {
    mapLfgMessageBaseToReply,
    mapLfgResultToMessageBase,
} from "../../../../../../src/presentation/discord/mappers/lfg.ts";
import { GUILD_CONFIG, LfgConstants, PUBLIC_CHANNEL_ID, ROOM } from "./fixtures.ts";

const defaultOptions = { getBoolean: () => false } as const;

describe(mapLfgMessageBaseToReply.name, () => {
    test("keeps positive messages public in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: {
                kind: ELfgResultKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: defaultOptions },
            guildConfig: GUILD_CONFIG,
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

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: GUILD_CONFIG,
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

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: null,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes non-positive messages ephemeral in the configured channel", () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.INVALID_ROOM_CODE },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test(`message visible to everyone when ${LfgConstants.LFG_SHOW_RESPONSE_OPTION_NAME} is true`, () => {
        const messageBase = mapLfgResultToMessageBase({
            result: { kind: ELfgResultKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            callerId: "owner",
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: { getBoolean: () => true } },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).not.toHaveProperty("flags");
    });
});
