import { userMention } from "discord.js";
import { describe, expect, test } from "vitest";
import { EMessageKind } from "../../src/bot/types.ts";
import * as LfgConstants from "../../src/lfg/constants.ts";
import mapLfgFeatureReturnToMessage from "../../src/lfg/mapper.ts";
import { ELfgFeatureReturnKind, type IRoom, type TLfgFeatureReturn } from "../../src/lfg/types.ts";

const ROOM: IRoom = {
    code: "alpha",
    ownerId: "owner",
    playerIds: ["player-1", "owner", "player-2"],
};

function roomDescription(room: IRoom) {
    return `\`${room.code}\`: ${userMention(room.ownerId)}${LfgConstants.LFG_ROOM_OWNER_SUFFIX}, ${userMention("player-1")}, ${userMention("player-2")}`;
}

// TODO: need to restore tests on flags!!!!
describe(mapLfgFeatureReturnToMessage.name, () => {
    test.each<{
        readonly name: string;
        readonly input: TLfgFeatureReturn;
        readonly expected: Pick<ReturnType<typeof mapLfgFeatureReturnToMessage>, "kind" | "embeds">;
    }>([
        {
            name: "non-empty room list",
            input: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [ROOM] } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ title: LfgConstants.LFG_ROOMS_TITLE, description: `- ${roomDescription(ROOM)}` }],
            },
        },
        {
            name: "empty room list",
            input: { kind: ELfgFeatureReturnKind.ROOMS_LISTED, value: { rooms: [] } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [
                    { title: LfgConstants.LFG_ROOMS_TITLE, description: LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION },
                ],
            },
        },
        {
            name: "help",
            input: { kind: ELfgFeatureReturnKind.HELP, value: { description: "help text" } },
            expected: {
                kind: EMessageKind.NEUTRAL,
                embeds: [{ title: LfgConstants.LFG_COMMANDS_TITLE, description: "help text" }],
            },
        },
        {
            name: "room created",
            input: { kind: ELfgFeatureReturnKind.ROOM_CREATED, value: { room: ROOM } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [{ title: LfgConstants.LFG_ROOM_CREATED_TITLE, description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room joined with previous room context",
            input: { kind: ELfgFeatureReturnKind.ROOM_JOINED, value: { room: ROOM, leftRoomCode: "beta" } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_ROOM_JOINED_TITLE,
                        description: `${LfgConstants.LFG_LEFT_ROOM_DESCRIPTION_PREFIX} \`beta\`.\n\n${roomDescription(ROOM)}`,
                    },
                ],
            },
        },
        {
            name: "ownership transferred",
            input: { kind: ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED, value: { room: ROOM } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [{ title: LfgConstants.LFG_OWNERSHIP_TRANSFERRED_TITLE, description: roomDescription(ROOM) }],
            },
        },
        {
            name: "player kicked",
            input: { kind: ELfgFeatureReturnKind.PLAYER_KICKED, value: { room: ROOM } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [{ title: LfgConstants.LFG_PLAYER_KICKED_TITLE, description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room left",
            input: { kind: ELfgFeatureReturnKind.ROOM_LEFT, value: { room: ROOM } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [{ title: LfgConstants.LFG_ROOM_LEFT_TITLE, description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room left and deleted",
            input: { kind: ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_ROOM_LEFT_TITLE,
                        description: `${LfgConstants.LFG_LEFT_ROOM_DESCRIPTION_PREFIX} \`${ROOM.code}\`. ${LfgConstants.LFG_ROOM_LEFT_AND_DELETED_DESCRIPTION}`,
                    },
                ],
            },
        },
        {
            name: "room disbanded",
            input: { kind: ELfgFeatureReturnKind.ROOM_DISBANDED, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.POSITIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_ROOM_DISBANDED_TITLE,
                        description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} \`${ROOM.code}\` ${LfgConstants.LFG_ROOM_DELETED_DESCRIPTION_SUFFIX}`,
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
                        title: LfgConstants.LFG_INVALID_ROOM_CODE_TITLE,
                        description: `${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_PREFIX} ${LfgConstants.LFG_MIN_ROOM_CODE_LENGTH} ${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_SEPARATOR} ${LfgConstants.LFG_MAX_ROOM_CODE_LENGTH} ${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_SUFFIX}`,
                    },
                ],
            },
        },
        {
            name: "already in a room",
            input: { kind: ELfgFeatureReturnKind.ALREADY_IN_A_ROOM },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_ALREADY_IN_A_ROOM_TITLE,
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
                        title: LfgConstants.LFG_ROOM_ALREADY_EXISTS_TITLE,
                        description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} \`${ROOM.code}\` ${LfgConstants.LFG_ROOM_ALREADY_EXISTS_DESCRIPTION_SUFFIX}`,
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
                        title: LfgConstants.LFG_ROOM_NOT_FOUND_TITLE,
                        description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} \`${ROOM.code}\` ${LfgConstants.LFG_ROOM_NOT_FOUND_DESCRIPTION_SUFFIX}`,
                    },
                ],
            },
        },
        {
            name: "already in target room",
            input: { kind: ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM, value: { room: ROOM } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [{ title: LfgConstants.LFG_ALREADY_IN_TARGET_ROOM_TITLE, description: roomDescription(ROOM) }],
            },
        },
        {
            name: "room full",
            input: { kind: ELfgFeatureReturnKind.ROOM_IS_FULL, value: { code: ROOM.code } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_ROOM_IS_FULL_TITLE,
                        description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} \`${ROOM.code}\` ${LfgConstants.LFG_ROOM_IS_FULL_DESCRIPTION_PREFIX} ${LfgConstants.LFG_MAX_ROOM_PLAYERS} ${LfgConstants.LFG_ROOM_IS_FULL_DESCRIPTION_SUFFIX}`,
                    },
                ],
            },
        },
        {
            name: "cannot transfer to yourself",
            input: { kind: ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        title: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_TITLE,
                        description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                    },
                ],
            },
        },
        {
            name: "player not in room",
            input: { kind: ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM, value: { targetId: "target" } },
            expected: {
                kind: EMessageKind.NEGATIVE,
                embeds: [
                    {
                        description: `${userMention("target")} ${LfgConstants.LFG_PLAYER_NOT_IN_ROOM_DESCRIPTION_SUFFIX}`,
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
                        title: LfgConstants.LFG_NOT_ROOM_OWNER_TITLE,
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
                        title: LfgConstants.LFG_CANNOT_KICK_YOURSELF_TITLE,
                        description: `${LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION_PREFIX} \`/${LfgConstants.LFG_COMMAND_NAME} ${LfgConstants.LFG_LEAVE_SUBCOMMAND_NAME}\` ${LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION_SUFFIX}`,
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
                        title: LfgConstants.LFG_INVALID_SUBCOMMAND_TITLE,
                        description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                    },
                ],
            },
        },
    ])("maps $name", ({ input, expected }) => {
        const privateResponse = mapLfgFeatureReturnToMessage(input);
        expect(privateResponse).toMatchObject(expected);

        // const publicResponse = mapLfgFeatureReturnToMessage(input);
        // if (expected.kind === EMessageKind.POSITIVE) {
        //     expect(publicResponse).toMatchObject(expected);
        //     expect(publicResponse).not.toHaveProperty("flags");
        // } else {
        //     expect(publicResponse).toMatchObject(expected);
        // }
    });
});
