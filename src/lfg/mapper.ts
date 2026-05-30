import { type InteractionReplyOptions, MessageFlags, userMention } from "discord.js";
import {
    createErrorMessage,
    createNegativeMessage,
    createNeutralMessage,
    createPositiveMessage,
} from "../bot/message.ts";
import * as LfgConstants from "./constants.ts";
import { ELfgFeatureReturnKind, type IRoom, type TLfgFeatureReturn } from "./types.ts";

function formatList(rooms: readonly IRoom[]) {
    if (rooms.length === 0) {
        return LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION;
    }
    return rooms.map((room) => `${LfgConstants.LFG_ROOM_LIST_ITEM_PREFIX}${formatRoom(room)}`).join("\n");
}

function formatRoom(room: IRoom) {
    return `${formatRoomCode(room.code)}: ${formatRoomPlayers(room)}`;
}

function formatRoomPlayers(room: IRoom) {
    return room.playerIds
        .toSorted((a, b) => (a === room.ownerId ? -1 : b === room.ownerId ? 1 : 0))
        .map(
            (playerId) =>
                `${userMention(playerId)}${playerId === room.ownerId ? LfgConstants.LFG_ROOM_OWNER_SUFFIX : ""}`,
        )
        .join(", ");
}

function formatRoomCode(code: string) {
    return `${LfgConstants.LFG_ROOM_CODE_MARKER}${code}${LfgConstants.LFG_ROOM_CODE_MARKER}`;
}

function formatCommand(commandName: string, subcommandName: string) {
    return `${LfgConstants.LFG_ROOM_CODE_MARKER}/${commandName} ${subcommandName}${LfgConstants.LFG_ROOM_CODE_MARKER}`;
}

function mapLfgFeatureReturnToMessage(result: TLfgFeatureReturn) {
    switch (result.kind) {
        case ELfgFeatureReturnKind.ROOMS_LISTED:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { title: LfgConstants.LFG_ROOMS_TITLE, description: formatList(result.value.rooms) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { title: LfgConstants.LFG_COMMANDS_TITLE, description: result.value.description },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_CREATED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: LfgConstants.LFG_ROOM_CREATED_TITLE, description: formatRoom(result.value.room) },
            });
        case ELfgFeatureReturnKind.ROOM_JOINED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_JOINED_TITLE,
                    description: `${result.value.leftRoomCode ? `${LfgConstants.LFG_LEFT_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.leftRoomCode)}.\n\n` : ""}${formatRoom(result.value.room)}`,
                },
            });
        case ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_OWNERSHIP_TRANSFERRED_TITLE,
                    description: formatRoom(result.value.room),
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.PLAYER_KICKED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: LfgConstants.LFG_PLAYER_KICKED_TITLE, description: formatRoom(result.value.room) },
            });
        case ELfgFeatureReturnKind.ROOM_LEFT:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: { title: LfgConstants.LFG_ROOM_LEFT_TITLE, description: formatRoom(result.value.room) },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_LEFT_AND_DELETED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_LEFT_TITLE,
                    description: `${LfgConstants.LFG_LEFT_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.code)}. ${LfgConstants.LFG_ROOM_LEFT_AND_DELETED_DESCRIPTION}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_DISBANDED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_DISBANDED_TITLE,
                    description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.code)} ${LfgConstants.LFG_ROOM_DELETED_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.INVALID_ROOM_CODE:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_INVALID_ROOM_CODE_TITLE,
                    description: `${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_PREFIX} ${LfgConstants.LFG_MIN_ROOM_CODE_LENGTH} ${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_SEPARATOR} ${LfgConstants.LFG_MAX_ROOM_CODE_LENGTH} ${LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION_SUFFIX}`,
                },
            });
        case ELfgFeatureReturnKind.ALREADY_IN_A_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ALREADY_IN_A_ROOM_TITLE,
                    description: LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_ALREADY_EXISTS_TITLE,
                    description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.code)} ${LfgConstants.LFG_ROOM_ALREADY_EXISTS_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_NOT_FOUND:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_NOT_FOUND_TITLE,
                    description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.code)} ${LfgConstants.LFG_ROOM_NOT_FOUND_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ALREADY_IN_TARGET_ROOM_TITLE,
                    description: formatRoom(result.value.room),
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.ROOM_IS_FULL:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_ROOM_IS_FULL_TITLE,
                    description: `${LfgConstants.LFG_ROOM_DESCRIPTION_PREFIX} ${formatRoomCode(result.value.code)} ${LfgConstants.LFG_ROOM_IS_FULL_DESCRIPTION_PREFIX} ${LfgConstants.LFG_MAX_ROOM_PLAYERS} ${LfgConstants.LFG_ROOM_IS_FULL_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_TITLE,
                    description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_PLAYER_NOT_IN_ROOM_TITLE,
                    description: `${userMention(result.value.targetId)} ${LfgConstants.LFG_PLAYER_NOT_IN_ROOM_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.NOT_ROOM_OWNER:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_NOT_ROOM_OWNER_TITLE,
                    description: LfgConstants.LFG_NOT_ROOM_OWNER_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_CANNOT_KICK_YOURSELF_TITLE,
                    description: `${LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION_PREFIX} ${formatCommand(LfgConstants.LFG_COMMAND_NAME, LfgConstants.LFG_LEAVE_SUBCOMMAND_NAME)} ${LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION_SUFFIX}`,
                },
                flags: MessageFlags.Ephemeral,
            });
        case ELfgFeatureReturnKind.NOT_IN_A_ROOM:
            return createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_NOT_IN_A_ROOM_TITLE,
                    description: LfgConstants.LFG_NOT_IN_A_ROOM_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.INVALID_SUBCOMMAND:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: LfgConstants.LFG_INVALID_SUBCOMMAND_TITLE,
                    description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                },
                flags: MessageFlags.Ephemeral,
            });
    }
}

export default mapLfgFeatureReturnToMessage;
