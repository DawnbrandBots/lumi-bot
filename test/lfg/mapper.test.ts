import { channelMention, MessageFlags, unorderedList, userMention, type ChatInputCommandInteraction } from "discord.js";
import { describe, expect, test } from "vitest";
import type { GuildConfig } from "../../src/admin/models/config.ts";
import { EMessageKind } from "../../src/bot/types.ts";
import * as LfgConstants from "../../src/lfg/constants.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "../../src/lfg/mapper.ts";
import {
    ELfgFeatureReturnKind,
    ELfgPlayerRemovalKind,
    type IRoom,
    type TLfgFeatureReturn,
} from "../../src/lfg/types.ts";

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

function roomDescription(room: IRoom) {
    return `\`${room.code}\`: ${userMention(room.ownerId)} (${LfgConstants.LFG_ROOM_OWNER_LABEL}), ${userMention("player-1")}, ${userMention("player-2")}`;
}

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
        "### Rooms",
        roomsDescription,
        "### Server config",
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

function getInteraction(channelId: string) {
    return { channelId } as ChatInputCommandInteraction;
}

describe(mapLfgFeatureReturnToMessageBase.name, () => {
    test.each<{
        readonly name: string;
        readonly callerId?: string;
        readonly input: TLfgFeatureReturn;
        readonly expected: Pick<ReturnType<typeof mapLfgFeatureReturnToMessageBase>, "kind" | "embeds">;
    }>([
        {
            name: "non-empty room list",
            input: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
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
            input: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [] } },
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
            name: "help",
            input: { kind: ELfgFeatureReturnKind.HELP },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ description: LfgConstants.LFG_HELP_DESCRIPTION }],
            },
        },
        {
            name: "room created",
            input: { kind: ELfgFeatureReturnKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} created room \`${ROOM.code}\`.`,
                    },
                ],
            },
        },
        {
            name: "room joined with previous room context",
            callerId: "player-1",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: { userId: "player-1", room: ROOM, leftRoomCode: "beta" },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} joined room \`${ROOM.code}\`.`,
                    },
                ],
            },
        },
        {
            name: "ownership transferred",
            input: {
                kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED,
                value: { userId: "owner", targetId: "player-1", room: ROOM },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} transferred \`${ROOM.code}\`'s ownership to ${userMention("player-1")}.`,
                    },
                ],
            },
        },
        {
            name: "player kicked",
            input: {
                kind: ELfgFeatureReturnKind.PLAYER_KICKED,
                value: {
                    userId: "owner",
                    targetId: "player-1",
                    room: ROOM,
                    removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} kicked ${userMention("player-1")} from \`${ROOM.code}\`.`,
                    },
                ],
            },
        },
        {
            name: "room left",
            callerId: "player-1",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_LEFT,
                value: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY, userId: "player-1", code: ROOM.code },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("player-1")} left \`${ROOM.code}\`.`,
                    },
                ],
            },
        },
        {
            name: "room left and deleted",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_LEFT,
                value: { kind: ELfgPlayerRemovalKind.ROOM_DELETED, userId: "owner", code: ROOM.code },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left \`${ROOM.code}\`. Room deleted.`,
                    },
                ],
            },
        },
        {
            name: "room left and ownership transferred",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_LEFT,
                value: {
                    kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                    userId: "owner",
                    code: ROOM.code,
                    newOwnerId: "player-1",
                },
            },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} left \`${ROOM.code}\`. Ownership transferred to ${userMention("player-1")}`,
                    },
                ],
            },
        },
        {
            name: "room disbanded",
            input: { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { userId: "owner", code: ROOM.code } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        description: `${userMention("owner")} disbanded room \`${ROOM.code}\`.`,
                    },
                ],
            },
        },
        {
            name: "invalid room code",
            input: { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE },
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
            input: { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM, value: { userId: "owner" } },
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
            input: { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room \`${ROOM.code}\` already exists.`,
                    },
                ],
            },
        },
        {
            name: "room not found",
            input: { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room \`${ROOM.code}\` does not exist.`,
                    },
                ],
            },
        },
        {
            name: "already in target room",
            input: {
                kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM,
                value: { userId: "owner", room: ROOM },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [{ description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room full",
            input: { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room \`${ROOM.code}\` already has ${LfgConstants.LFG_MAX_ROOM_PLAYERS} players.`,
                    },
                ],
            },
        },
        {
            name: "cannot transfer to yourself",
            input: {
                kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF,
                value: { userId: "owner", code: ROOM.code },
            },
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
                kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: "owner", targetId: "target", code: ROOM.code },
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
            input: { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER },
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
            input: { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF },
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
            input: { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM },
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
            input: { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND },
            expected: {
                kind: EMessageKind.ERROR,
                embeds: [
                    {
                        description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                    },
                ],
            },
        },
    ])("maps $name", ({ callerId = "owner", input, expected }) => {
        const messageBase = mapLfgFeatureReturnToMessageBase(input, callerId);
        expect(messageBase).toMatchObject(expected);
    });

    test.each([
        {
            name: "room creation",
            input: { kind: ELfgFeatureReturnKind.ROOM_CREATED, value: { userId: "owner", room: ROOM } } as const,
            expected: `${userMention("admin")} created room \`${ROOM.code}\` with ${userMention("owner")} as owner.`,
        },
        {
            name: "player move",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: { userId: "player-1", room: ROOM },
            } as const,
            expected: `${userMention("admin")} moved ${userMention("player-1")} to room \`${ROOM.code}\`.`,
        },
        {
            name: "ownership transfer",
            input: {
                kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED,
                value: { userId: "owner", targetId: "player-1", room: ROOM },
            } as const,
            expected: `${userMention("admin")} transferred \`${ROOM.code}\`'s ownership to ${userMention("player-1")}.`,
        },
        {
            name: "player kick",
            input: {
                kind: ELfgFeatureReturnKind.PLAYER_KICKED,
                value: {
                    userId: "owner",
                    targetId: "player-1",
                    room: ROOM,
                    removalResult: { kind: ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY },
                },
            } as const,
            expected: `${userMention("admin")} kicked ${userMention("player-1")} from \`${ROOM.code}\`.`,
        },
        {
            name: "room disband",
            input: {
                kind: ELfgFeatureReturnKind.ROOM_DISBANDED,
                value: { userId: "owner", code: ROOM.code },
            } as const,
            expected: `${userMention("admin")} disbanded room \`${ROOM.code}\`.`,
        },
        {
            name: "player already in a room",
            input: {
                kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM,
                value: { userId: "owner" },
            } as const,
            expected: `${userMention("owner")} is already in a room.`,
        },
        {
            name: "player already in target room",
            input: {
                kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM,
                value: { userId: "owner", room: ROOM },
            } as const,
            expected: `${userMention("owner")} is already in room \`${ROOM.code}\`.`,
        },
        {
            name: "current owner selected for transfer",
            input: {
                kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF,
                value: { userId: "owner", code: ROOM.code },
            } as const,
            expected: `${userMention("owner")} already owns room \`${ROOM.code}\`.`,
        },
        {
            name: "player not in target room",
            input: {
                kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM,
                value: { ownerId: "owner", targetId: "player-1", code: ROOM.code },
            } as const,
            expected: `${userMention("player-1")} is not in room \`${ROOM.code}\`.`,
        },
    ])("maps managed $name", ({ input, expected }) => {
        const messageBase = mapLfgFeatureReturnToMessageBase(input, "admin");

        expect(messageBase.embeds[0]?.description).toBe(expected);
    });

    test.each([
        {
            removalResult: {
                kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                newOwnerId: "player-2",
            } as const,
            suffix: ` Ownership transferred to ${userMention("player-2")}.`,
        },
        {
            removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED } as const,
            suffix: " Room deleted.",
        },
    ])("includes kick removal consequence", ({ removalResult, suffix }) => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            {
                kind: ELfgFeatureReturnKind.PLAYER_KICKED,
                value: { userId: "owner", targetId: "owner", room: ROOM, removalResult },
            },
            "admin",
        );

        expect(messageBase.embeds[0]?.description).toBe(
            `${userMention("admin")} kicked ${userMention("owner")} from \`${ROOM.code}\`.${suffix}`,
        );
    });

    test.each([
        {
            removalResult: {
                kind: ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED,
                newOwnerId: "player-2",
            } as const,
            suffix: ` Ownership of \`beta\` transferred to ${userMention("player-2")}.`,
        },
        {
            removalResult: { kind: ELfgPlayerRemovalKind.ROOM_DELETED } as const,
            suffix: " Room `beta` deleted.",
        },
    ])("includes managed move removal consequence", ({ removalResult, suffix }) => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            {
                kind: ELfgFeatureReturnKind.ROOM_JOINED,
                value: {
                    userId: "owner",
                    room: ROOM,
                    leftRoomCode: "beta",
                    removalResult,
                },
            },
            "admin",
        );

        expect(messageBase.embeds[0]?.description).toBe(
            `${userMention("admin")} moved ${userMention("owner")} to room \`${ROOM.code}\`.${suffix}`,
        );
    });

    test("maps status with configured LFG channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            "owner",
            GUILD_CONFIG,
        );

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

describe(mapLfgMessageBaseToReply.name, () => {
    test("keeps positive messages public in the configured channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            "owner",
        );

        const reply = mapLfgMessageBaseToReply(messageBase, getInteraction(PUBLIC_CHANNEL_ID), GUILD_CONFIG);

        expect(reply).toEqual(messageBase);
        expect(reply).not.toHaveProperty("flags");
    });

    test("makes positive messages ephemeral outside the configured channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            "owner",
        );

        const reply = mapLfgMessageBaseToReply(messageBase, getInteraction("other-channel"), GUILD_CONFIG);

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes positive messages ephemeral when no channel is configured", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            {
                kind: ELfgFeatureReturnKind.ROOM_CREATED,
                value: { userId: "owner", room: ROOM },
            },
            "owner",
        );

        const reply = mapLfgMessageBaseToReply(messageBase, getInteraction("other-channel"), null);

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });

    test("makes non-positive messages ephemeral in the configured channel", () => {
        const messageBase = mapLfgFeatureReturnToMessageBase(
            { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE },
            "owner",
        );

        const reply = mapLfgMessageBaseToReply(messageBase, getInteraction(PUBLIC_CHANNEL_ID), GUILD_CONFIG);

        expect(reply).toMatchObject({ flags: [MessageFlags.Ephemeral] });
    });
});
