import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags, userMention, type InteractionReplyOptions } from "discord.js";
import type { GuildConfig } from "../admin/models/config.ts";
import {
    createErrorMessage,
    createNegativeMessage,
    createNeutralMessage,
    createPositiveMessage,
} from "../bot/message.ts";
import { EMessageKind } from "../bot/types.ts";
import * as LfgConstants from "./constants.ts";
import type { TLfgFeatureReturnOfKind } from "./types.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type IRoom, type TLfgFeatureReturn } from "./types.ts";

function formatList(rooms: readonly IRoom[]) {
    if (rooms.length === 0) {
        return LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION;
    }
    return rooms.map((room) => `- ${formatRoom(room)}`).join("\n");
}

function formatRoom(room: IRoom) {
    return `${formatRoomCode(room.code)}: ${formatRoomPlayers(room)}`;
}

function formatRoomPlayers(room: IRoom) {
    return room.playerIds
        .toSorted((a, b) => (a === room.ownerId ? -1 : b === room.ownerId ? 1 : 0))
        .map(
            (playerId) =>
                `${userMention(playerId)}${playerId === room.ownerId ? ` (${LfgConstants.LFG_ROOM_OWNER_LABEL})` : ""}`,
        )
        .join(", ");
}

function formatRoomCode(code: string) {
    return `${LfgConstants.LFG_ROOM_CODE_MARKER}${code}${LfgConstants.LFG_ROOM_CODE_MARKER}`;
}

function formatRoomCreated(userId: string, room: IRoom) {
    return `${userMention(userId)} created room ${formatRoomCode(room.code)}.`;
}

function formatRoomJoined(userId: string, room: IRoom) {
    return `${userMention(userId)} joined room ${formatRoomCode(room.code)}.`;
}

function formatOwnershipTransferred(userId: string, targetId: string, room: IRoom) {
    return `${userMention(userId)} transferred ${formatRoomCode(room.code)}'s ownership to ${userMention(targetId)}.`;
}

function formatPlayerKicked(userId: string, targetId: string, room: IRoom) {
    return `${userMention(userId)} kicked ${userMention(targetId)} from ${formatRoomCode(room.code)}.`;
}

function formatRoomLeft(arg: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOM_LEFT>) {
    const res = `${userMention(arg.value.userId)} left ${formatRoomCode(arg.value.code)}.`;
    switch (arg.value.kind) {
        case ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED:
            return res + ` Ownership transferred to ${userMention(arg.value.newOwnerId)}`;
        case ELfgPlayerRemovalKind.ROOM_DELETED:
            return res + ` Room deleted.`;
        case ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY:
            return res;
    }
}

function formatRoomDisbanded(userId: string, code: string) {
    return `${userMention(userId)} disbanded ${formatRoomCode(code)}.`;
}

function formatRoomAlreadyExists(code: string) {
    return `Room ${formatRoomCode(code)} already exists.`;
}

function formatRoomNotFound(code: string) {
    return `Room ${formatRoomCode(code)} does not exist.`;
}

function formatRoomIsFull(code: string) {
    return `Room ${formatRoomCode(code)} already has ${LfgConstants.LFG_MAX_ROOM_PLAYERS} players.`;
}

function formatPlayerNotInRoom(targetId: string) {
    return `${userMention(targetId)} is not in your room.`;
}

export function mapLfgFeatureReturnToMessageBase(result: TLfgFeatureReturn) {
    switch (result.kind) {
        case ELfgFeatureReturnKind.ROOMS_LISTED:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { description: formatList(result.value.rooms) },
            });
        case ELfgFeatureReturnKind.HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { description: LfgConstants.LFG_HELP_DESCRIPTION },
            });
        case ELfgFeatureReturnKind.ROOM_CREATED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: formatRoomCreated(result.value.userId, result.value.room),
                },
            });
        case ELfgFeatureReturnKind.ROOM_JOINED:
            return createPositiveMessage({
                embed: {
                    description: formatRoomJoined(result.value.userId, result.value.room),
                },
            });
        case ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED:
            return createPositiveMessage({
                embed: {
                    description: formatOwnershipTransferred(
                        result.value.userId,
                        result.value.targetId,
                        result.value.room,
                    ),
                },
            });
        case ELfgFeatureReturnKind.PLAYER_KICKED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: formatPlayerKicked(result.value.userId, result.value.targetId, result.value.room),
                },
            });
        case ELfgFeatureReturnKind.ROOM_LEFT:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: formatRoomLeft(result),
                },
            });
        case ELfgFeatureReturnKind.ROOM_DISBANDED:
            return createPositiveMessage({
                embed: {
                    description: formatRoomDisbanded(result.value.userId, result.value.code),
                },
            });
        case ELfgFeatureReturnKind.INVALID_ROOM_CODE:
            return createNegativeMessage({
                embed: {
                    description: LfgConstants.LFG_INVALID_ROOM_CODE_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.ALREADY_IN_A_ROOM:
            return createNegativeMessage({
                embed: {
                    description: LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.ROOM_ALREADY_EXISTS:
            return createNegativeMessage({
                embed: {
                    description: formatRoomAlreadyExists(result.value.code),
                },
            });
        case ELfgFeatureReturnKind.ROOM_NOT_FOUND:
            return createNegativeMessage({
                embed: {
                    description: formatRoomNotFound(result.value.code),
                },
            });
        case ELfgFeatureReturnKind.ALREADY_IN_TARGET_ROOM:
            return createNegativeMessage({
                embed: {
                    description: formatRoom(result.value.room),
                },
            });
        case ELfgFeatureReturnKind.ROOM_IS_FULL:
            return createNegativeMessage({
                embed: {
                    description: formatRoomIsFull(result.value.code),
                },
            });
        case ELfgFeatureReturnKind.CANNOT_TRANSFER_TO_YOURSELF:
            return createNegativeMessage({
                embed: {
                    description: LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM:
            return createNegativeMessage({
                embed: {
                    description: formatPlayerNotInRoom(result.value.targetId),
                },
            });
        case ELfgFeatureReturnKind.NOT_ROOM_OWNER:
            return createNegativeMessage({
                embed: {
                    description: LfgConstants.LFG_NOT_ROOM_OWNER_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.CANNOT_KICK_YOURSELF:
            return createNegativeMessage({
                embed: {
                    description: LfgConstants.LFG_CANNOT_KICK_YOURSELF_DESCRIPTION,
                },
            });
        case ELfgFeatureReturnKind.NOT_IN_A_ROOM:
            return createNegativeMessage({
                embed: { description: LfgConstants.LFG_NOT_IN_A_ROOM_DESCRIPTION },
            });
        case ELfgFeatureReturnKind.INVALID_SUBCOMMAND:
            return createErrorMessage({
                embed: {
                    description: LfgConstants.LFG_INVALID_SUBCOMMAND_DESCRIPTION,
                },
            });
    }
}

export function mapLfgMessageBaseToReply(
    messageBase: ReturnType<typeof mapLfgFeatureReturnToMessageBase>,
    interaction: ChatInputCommandInteraction,
    guildConfig: GuildConfig | null,
) {
    if (messageBase.kind === EMessageKind.POSITIVE && interaction.channelId === guildConfig?.lfgChannel) {
        return messageBase;
    }
    return { ...messageBase, flags: [MessageFlags.Ephemeral] } as const;
}
