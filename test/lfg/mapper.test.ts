import {
    channelMention,
    heading,
    HeadingLevel,
    inlineCode,
    MessageFlags,
    unorderedList,
    userMention,
} from "discord.js";
import { describe, expect, test } from "vitest";
import type { GuildConfig } from "../../src/admin/models/config.ts";
import { EMessageKind } from "../../src/bot/types.ts";
import * as LfgConstants from "../../src/lfg/constants.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "../../src/lfg/mapper.ts";
import type { IRoom } from "../../src/lfg/types.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind } from "../../src/lfg/types.ts";

const ROOM: IRoom = {
    code: "alpha",
    ownerId: "owner",
    playerIds: ["player-1", "owner", "player-2"],
};
const PUBLIC_CHANNEL_ID = "public-channel";
const GUILD_CONFIG = {
    guild: "guild-1",
    lfgChannel: PUBLIC_CHANNEL_ID,
    lfgRolePingCooldownMinutes: 45,
} as GuildConfig;

function statusDescription({
    roomsDescription,
    lfgChannel,
    lfgRolePingCooldownMinutes = null,
}: {
    readonly roomsDescription: string;
    readonly lfgChannel: string;
    readonly lfgRolePingCooldownMinutes?: number | null;
}) {
    return [
        heading("Rooms", HeadingLevel.Three),
        roomsDescription,
        heading("Server config", HeadingLevel.Three),
        unorderedList([
            `LFG channel: ${lfgChannel}`,
            `LFG roles: ${LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION}`,
            `LFG roles ping cooldown: ${
                lfgRolePingCooldownMinutes != null
                    ? `${lfgRolePingCooldownMinutes} minutes`
                    : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION
            }`,
        ]),
    ].join("\n");
}

function roomDescription(room: IRoom) {
    return `${inlineCode(room.code)}: ${userMention(room.ownerId)} (owner), ${userMention("player-1")}, ${userMention("player-2")}`;
}

type Input = Parameters<typeof mapLfgFeatureReturnToMessageBase>[0];

describe(mapLfgFeatureReturnToMessageBase.name, () => {
    test.each<{
        readonly name: string;
        readonly input: Input;
        readonly expected: Pick<ReturnType<typeof mapLfgFeatureReturnToMessageBase>, "kind" | "embeds">;
    }>([
        {
            name: "non-empty room list",
            input: { result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: `- ${roomDescription(ROOM)}`,
                            lfgChannel: LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
                        }),
                    },
                ],
            },
        },
        {
            name: "empty room list",
            input: { result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION,
                            lfgChannel: LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
                        }),
                    },
                ],
            },
        },
        {
            name: "maps status with configured LFG channel",
            input: {
                result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
                guildConfig: GUILD_CONFIG,
            },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    {
                        description: statusDescription({
                            roomsDescription: `- ${roomDescription(ROOM)}`,
                            lfgChannel: channelMention(PUBLIC_CHANNEL_ID),
                            lfgRolePingCooldownMinutes: 45,
                        }),
                    },
                ],
            },
        },
        {
            name: "help",
            input: { result: { kind: ELfgFeatureReturnKind.HELP } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                embeds: [{ description: expect.any(String) }],
            },
        },
        {
            name: "room created",
            input: {
                result: { kind: ELfgFeatureReturnKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} created room ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "room joined with previous room context",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.ROOM_JOINED,
                    value: { userId: "player-1", room: ROOM, leftRoomCode: "beta" },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} joined room ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "ownership transferred",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED,
                    value: { userId: "owner", targetId: "player-1", room: ROOM },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} transferred ${inlineCode(ROOM.code)}'s ownership to ${userMention("player-1")}.`,
                    },
                ],
            },
        },
        {
            name: "player kicked",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.PLAYER_KICKED,
                    value: { userId: "owner", targetId: "player-1", room: ROOM },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} kicked ${userMention("player-1")} from ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "room left",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY, userId: "player-1", code: ROOM.code },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} left ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "room left and deleted",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.ROOM_LEFT,
                    value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: "owner", code: ROOM.code },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left ${inlineCode(ROOM.code)}. Room deleted.`,
                    },
                ],
            },
        },
        {
            name: "room left and ownership transferred",
            input: {
                result: {
                    kind: ELfgFeatureReturnKind.ROOM_LEFT,
                    value: {
                        kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                        userId: "owner",
                        code: ROOM.code,
                        newOwnerId: "player-1",
                    },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left ${inlineCode(ROOM.code)}. Ownership transferred to ${userMention("player-1")}`,
                    },
                ],
            },
        },
        {
            name: "room disbanded",
            input: {
                result: { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} disbanded ${inlineCode(ROOM.code)}.`,
                    },
                ],
            },
        },
        {
            name: "invalid room code",
            input: { result: { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "already in a room",
            input: { result: { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "room already exists",
            input: {
                result: { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already exists.`,
                    },
                ],
            },
        },
        {
            name: "room not found",
            input: { result: { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} does not exist.`,
                    },
                ],
            },
        },
        {
            name: "already in target room",
            input: {
                result: { kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM, value: { room: ROOM } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [{ description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room full",
            input: { result: { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already has ${LfgConstants.LFG_MAX_ROOM_PLAYERS} players.`,
                    },
                ],
            },
        },
        {
            name: "cannot transfer to yourself",
            input: { result: { kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "player not in room",
            input: {
                result: { kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM, value: { targetId: "target" } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `${userMention("target")} is not in your room.`,
                    },
                ],
            },
        },
        {
            name: "not room owner",
            input: { result: { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_NOT_ROOM_OWNER_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "cannot kick yourself",
            input: { result: { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "not in a room",
            input: { result: { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_NOT_IN_A_ROOM_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "invalid subcommand",
            input: { result: { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } },
            expected: {
                kind: EMessageKind.ERROR,
                embeds: [
                    {
                        description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                    },
                ],
            },
        },
    ])("maps $name", ({ input, expected }) => {
        const messageBase = mapLfgFeatureReturnToMessageBase(input);
        expect(messageBase).toMatchObject(expected);
    });

    test("maps status with configured LFG channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            guildConfig: GUILD_CONFIG,
        });

        expect(messageBase).toMatchObject({
            kind: EMessageKind.NEUTRAL,
            embeds: [
                {
                    description: statusDescription({
                        roomsDescription: `- ${roomDescription(ROOM)}`,
                        lfgChannel: channelMention(PUBLIC_CHANNEL_ID),
                        lfgRolePingCooldownMinutes: 45,
                    }),
                },
            ],
        });
    });
});

const defaultOptions = { getBoolean: () => false } as const;

describe(mapLfgMessageBaseToReply.name, () => {
    test("keeps positive messages public in the configured channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
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
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes positive messages ephemeral when no channel is configured", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: "other-channel", options: defaultOptions },
            guildConfig: null,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes non-positive messages ephemeral in the configured channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE },
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: defaultOptions },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test(`message visible to everyone when ${LfgConstants.LFG_SHOW_RESPONSE_OPTION_NAME} is true`, () => {
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
        });

        const reply = mapLfgMessageBaseToReply({
            messageBase,
            interaction: { channelId: PUBLIC_CHANNEL_ID, options: { getBoolean: () => true } },
            guildConfig: GUILD_CONFIG,
        });

        expect(reply).not.toHaveProperty("flags");
    });
});
