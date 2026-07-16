import type { ChatInputCommandInteraction } from "discord.js";
import {
    channelMention,
    heading,
    MessageFlags,
    roleMention,
    unorderedList,
    userMention,
    type InteractionReplyOptions,
} from "discord.js";
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
    return unorderedList(rooms.map(formatRoom));
}

function formatStatus(rooms: readonly IRoom[], guildConfig: GuildConfig | null) {
    const lfgChannel = guildConfig?.lfgChannel
        ? channelMention(guildConfig.lfgChannel)
        : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION;
    const lfgRoles =
        guildConfig?.lfgRoles && guildConfig.lfgRoles.length
            ? Array.from(guildConfig.lfgRoles)
                  .map((lfgRole) => roleMention(lfgRole.role))
                  .join(", ")
            : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION;
    const lfgRolePingCooldown =
        guildConfig?.lfgRolePingCooldownMinutes != null
            ? `${guildConfig.lfgRolePingCooldownMinutes} minutes`
            : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION;
    return [
        heading("Rooms", 3),
        formatList(rooms),
        heading("Server config", 3),
        unorderedList([
            `LFG channel: ${lfgChannel}`,
            `LFG roles: ${lfgRoles}`,
            `LFG roles ping cooldown: ${lfgRolePingCooldown}`,
        ]),
    ].join("\n");
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

function formatRoomCreated(callerId: string, userId: string, room: IRoom) {
    if (callerId !== userId) {
        return `${userMention(callerId)} created room ${formatRoomCode(room.code)} with ${userMention(userId)} as owner.`;
    }
    return `${userMention(userId)} created room ${formatRoomCode(room.code)}.`;
}

function formatRoomJoined(
    callerId: string,
    userId: string,
    room: IRoom,
    leftRoomCode?: string,
    removalResult?: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.ROOM_JOINED>["value"]["removalResult"],
) {
    if (callerId !== userId) {
        const result = `${userMention(callerId)} moved ${userMention(userId)} to room ${formatRoomCode(room.code)}.`;
        if (!leftRoomCode || !removalResult) {
            return result;
        }
        switch (removalResult.kind) {
            case ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED:
                return (
                    result +
                    ` Ownership of ${formatRoomCode(leftRoomCode)} transferred to ${userMention(removalResult.newOwnerId)}.`
                );
            case ELfgPlayerRemovalKind.ROOM_DELETED:
                return result + ` Room ${formatRoomCode(leftRoomCode)} deleted.`;
            case ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY:
                return result;
        }
    }
    return `${userMention(userId)} joined room ${formatRoomCode(room.code)}.`;
}

function formatOwnershipTransferred(callerId: string, userId: string, targetId: string, room: IRoom) {
    const transfererId = callerId === userId ? userId : callerId;
    return `${userMention(transfererId)} transferred ${formatRoomCode(room.code)}'s ownership to ${userMention(targetId)}.`;
}

function formatPlayerKicked(
    callerId: string,
    userId: string,
    targetId: string,
    room: IRoom,
    removalResult: TLfgFeatureReturnOfKind<ELfgFeatureReturnKind.PLAYER_KICKED>["value"]["removalResult"],
) {
    const result = `${userMention(callerId === userId ? userId : callerId)} kicked ${userMention(targetId)} from ${formatRoomCode(room.code)}.`;
    switch (removalResult.kind) {
        case ELfgPlayerRemovalKind.OWNERSHIP_TRANSFERRED:
            return result + ` Ownership transferred to ${userMention(removalResult.newOwnerId)}.`;
        case ELfgPlayerRemovalKind.ROOM_DELETED:
            return result + " Room deleted.";
        case ELfgPlayerRemovalKind.LEFT_ROOM_NORMALLY:
            return result;
    }
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

function formatRoomDisbanded(callerId: string, code: string) {
    return `${userMention(callerId)} disbanded room ${formatRoomCode(code)}.`;
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

function formatAlreadyInRoom(callerId: string, userId: string) {
    if (callerId === userId) {
        return LfgConstants.LFG_ALREADY_IN_A_ROOM_DESCRIPTION;
    }
    return `${userMention(userId)} is already in a room.`;
}

function formatAlreadyInTargetRoom(callerId: string, userId: string, room: IRoom) {
    if (callerId === userId) {
        return formatRoom(room);
    }
    return `${userMention(userId)} is already in room ${formatRoomCode(room.code)}.`;
}

function formatCannotTransferToCurrentOwner(callerId: string, userId: string, code: string) {
    if (callerId === userId) {
        return LfgConstants.LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION;
    }
    return `${userMention(userId)} already owns room ${formatRoomCode(code)}.`;
}

function formatPlayerNotInRoom(callerId: string, ownerId: string, targetId: string, code: string) {
    if (callerId !== ownerId) {
        return `${userMention(targetId)} is not in room ${formatRoomCode(code)}.`;
    }
    return `${userMention(targetId)} is not in your room.`;
}

export function mapLfgFeatureReturnToMessageBase(
    result: TLfgFeatureReturn,
    callerId: string,
    guildConfig: GuildConfig | null = null,
) {
    switch (result.kind) {
        case ELfgFeatureReturnKind.ROOMS_LISTED:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { description: formatStatus(result.value.rooms, guildConfig) },
            });
        case ELfgFeatureReturnKind.HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: { description: LfgConstants.LFG_HELP_DESCRIPTION },
            });
        case ELfgFeatureReturnKind.ROOM_CREATED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: formatRoomCreated(callerId, result.value.userId, result.value.room),
                },
            });
        case ELfgFeatureReturnKind.ROOM_JOINED:
            return createPositiveMessage({
                embed: {
                    description: formatRoomJoined(
                        callerId,
                        result.value.userId,
                        result.value.room,
                        result.value.leftRoomCode,
                        result.value.removalResult,
                    ),
                },
            });
        case ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED:
            return createPositiveMessage({
                embed: {
                    description: formatOwnershipTransferred(
                        callerId,
                        result.value.userId,
                        result.value.targetId,
                        result.value.room,
                    ),
                },
            });
        case ELfgFeatureReturnKind.PLAYER_KICKED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: formatPlayerKicked(
                        callerId,
                        result.value.userId,
                        result.value.targetId,
                        result.value.room,
                        result.value.removalResult,
                    ),
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
                    description: formatRoomDisbanded(callerId, result.value.code),
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
                    description: formatAlreadyInRoom(callerId, result.value.userId),
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
                    description: formatAlreadyInTargetRoom(callerId, result.value.userId, result.value.room),
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
                    description: formatCannotTransferToCurrentOwner(callerId, result.value.userId, result.value.code),
                },
            });
        case ELfgFeatureReturnKind.PLAYER_NOT_IN_ROOM:
            return createNegativeMessage({
                embed: {
                    description: formatPlayerNotInRoom(
                        callerId,
                        result.value.ownerId,
                        result.value.targetId,
                        result.value.code,
                    ),
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
