import { type InteractionReplyOptions, MessageFlags, userMention } from "discord.js";
import {
    createErrorMessage,
    createNegativeMessage,
    createNeutralMessage,
    createPositiveMessage,
} from "../bot/message.ts";
import {
    LFG_COMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_MAX_ROOM_CODE_LENGTH,
    LFG_MAX_ROOM_PLAYERS,
    LFG_MIN_ROOM_CODE_LENGTH,
} from "./constants.ts";
import { ELfgFeatureReturnKind, type IRoom, type TLfgFeatureReturn } from "./types.ts";

function formatList(rooms: readonly IRoom[]) {
    if (rooms.length === 0) {
        return "No active rooms. :(";
    }
    return rooms.map((room) => `- ${formatRoom(room)}`).join("\n");
}

function formatRoom(room: IRoom) {
    return `\`${room.code}\`: ${formatRoomPlayers(room)}`;
}

function formatRoomPlayers(room: IRoom) {
    return room.playerIds
        .toSorted((a, b) => (a === room.ownerId ? -1 : b === room.ownerId ? 1 : 0))
        .map((playerId) => `${userMention(playerId)}${playerId === room.ownerId ? " (owner)" : ""}`)
        .join(", ");
}

function mapLfgFeatureReturnToMessage(result: TLfgFeatureReturn) {
    switch (result.kind) {
        case ELfgFeatureReturnKind.ROOMS_LISTED:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { title: "LFG Rooms", description: formatList(result.value.rooms) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { title: "LFG Commands", description: result.value.description },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_CREATED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: "Room created", description: formatRoom(result.value.room) },
            });
        case ELfgFeatureReturnKind.ROOM_JOINED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "Room joined",
                    description: `${result.value.leftRoomCode ? `Left room \`${result.value.leftRoomCode}\`.\n\n` : ""}${formatRoom(result.value.room)}`,
                },
            });
        case ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: "Ownership transferred", description: formatRoom(result.value.room) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.PLAYER_KICKED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: "Player kicked", description: formatRoom(result.value.room) },
            });
        case ELfgFeatureReturnKind.ROOM_LEFT:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: "Room left", description: formatRoom(result.value.room) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "Room left",
                    description: `Left room \`${result.value.code}\`. The room was deleted because it is empty.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_DISBANDED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: "Room disbanded", description: `Room \`${result.value.code}\` was deleted.` },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.INVALID_ROOM_CODE:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: "Invalid room code",
                    description: `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`,
                },
            });
        case ELfgFeatureReturnKind.ALREADY_IN_A_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: "Already in a room",
                    description: "Leave your current room before creating a new one.",
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { title: "Room already exists", description: `Room \`${result.value.code}\` already exists.` },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_NOT_FOUND:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { title: "Room not found", description: `Room \`${result.value.code}\` does not exist.` },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { title: "Already in room", description: formatRoom(result.value.room) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_IS_FULL:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: "Room is full",
                    description: `Room \`${result.value.code}\` already has ${LFG_MAX_ROOM_PLAYERS} players.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { title: "Cannot transfer to yourself", description: "Choose another player in your room." },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: "Player not in room",
                    description: `${userMention(result.value.targetId)} is not in your room.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.NOT_ROOM_OWNER:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: { title: "Not room owner", description: "Only the room owner can do that." },
            });
        case ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: "Cannot kick yourself",
                    description: `Use \`/${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}\` to leave your room.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.NOT_IN_A_ROOM:
            return createNegativeMessage({
                embed: { title: "Not in a room", description: "Join or create a room first." },
            });
        case ELfgFeatureReturnKind.INVALID_SUBCOMMAND:
            return createErrorMessage<InteractionReplyOptions>({
                embed: { title: "Invalid subcommand", description: "Please specify a valid subcommand." },
                flags: MessageFlags.Ephemeral,
            });
    }
}

export default mapLfgFeatureReturnToMessage;
