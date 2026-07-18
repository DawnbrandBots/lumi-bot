import { inlineCode, MessageFlags, userMention } from "discord.js";
import { describe, expect, test } from "vitest";
import { EMessageKind } from "../../src/bot/types.ts";
import * as LfgConstants from "../../src/lfg/constants.ts";
import mapLfgFeatureReturnToMessage from "../../src/lfg/mapper.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type IRoom } from "../../src/lfg/types.ts";

const ROOM: IRoom = {
    code: "alpha",
    ownerId: "owner",
    playerIds: ["player-1", "owner", "player-2"],
};

function roomDescription(room: IRoom) {
    return `${inlineCode(room.code)}: ${userMention(room.ownerId)} (owner), ${userMention("player-1")}, ${userMention("player-2")}`;
}

type Input = Parameters<typeof mapLfgFeatureReturnToMessage>[0];

describe(mapLfgFeatureReturnToMessage.name, () => {
    /**
     * Default interaction object to satisfy type checks.
     */
    const interaction: Input["interaction"] = { options: { getBoolean: () => false } };

    test.each<{
        readonly name: string;
        readonly input: Input;
        readonly expected: Pick<ReturnType<typeof mapLfgFeatureReturnToMessage>, "kind" | "embeds" | "flags">;
    }>([
        {
            name: "non-empty room list",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ description: `- ${roomDescription(ROOM)}` }],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "non-empty room list (shown to everyone)",
            input: {
                interaction: { options: { getBoolean: () => true } },
                result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ description: `- ${roomDescription(ROOM)}` }],
                flags: undefined,
            },
        },
        {
            name: "empty room list",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [] } } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ description: LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION }],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "help",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.HELP } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                embeds: [{ description: expect.any(String) }],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "room created",
            input: {
                interaction,
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
                interaction,
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
                interaction,
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
                interaction,
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
                interaction,
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
                interaction,
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
                interaction,
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
                interaction,
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
            input: { interaction, result: { kind: ELfgFeatureReturnKind.INVALID_ROOM_CODE } },
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
            input: { interaction, result: { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "room already exists",
            input: {
                interaction,
                result: { kind: ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS, value: { code: ROOM.code } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already exists.`,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "room not found",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.ROOM_NOT_FOUND, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} does not exist.`,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "already in target room",
            input: {
                interaction,
                result: { kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM, value: { room: ROOM } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [{ description: roomDescription(ROOM) }],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "room full",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code: ROOM.code } } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `Room ${inlineCode(ROOM.code)} already has ${LfgConstants.LFG_MAX_ROOM_PLAYERS} players.`,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "cannot transfer to yourself",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "player not in room",
            input: {
                interaction,
                result: { kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM, value: { targetId: "target" } },
            },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `${userMention("target")} is not in your room.`,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "not room owner",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.NOT_ROOM_OWNER } },
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
            input: { interaction, result: { kind: ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
        {
            name: "not in a room",
            input: { interaction, result: { kind: ELfgFeatureReturnKind.NOT_IN_A_ROOM } },
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
            input: { interaction, result: { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } },
            expected: {
                kind: EMessageKind.ERROR,
                embeds: [
                    {
                        description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                    },
                ],
                flags: MessageFlags.Ephemeral,
            },
        },
    ])("maps $name", ({ input, expected }) => {
        const response = mapLfgFeatureReturnToMessage(input);

        expect(response).toMatchObject(expected);
    });
});
