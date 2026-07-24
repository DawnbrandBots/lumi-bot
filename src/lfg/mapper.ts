import type { ChatInputCommandInteraction } from "discord.js";
import { channelMention, heading, inlineCode, MessageFlags, unorderedList, userMention } from "discord.js";
import type { PickDeep } from "type-fest";
import type { GuildConfig } from "../admin/models/config.ts";
import {
    createErrorMessage,
    createNegativeMessage,
    createNeutralMessage,
    createPositiveMessage,
} from "../bot/message.ts";
import { EMessageKind } from "../bot/types.ts";
import * as LfgConstants from "./constants.ts";
import { LFG_SHOW_RESPONSE_OPTION_NAME } from "./constants.ts";
import type { TLfgFeatureReturnOfKind } from "./types.ts";
import { ELfgFeatureReturnKind, ELfgPlayerRemovalKind, type IRoom, type TLfgFeatureReturn } from "./types.ts";

function formatList(rooms: readonly IRoom[]) {
    if (rooms.length === 0) {
        return LfgConstants.LFG_EMPTY_ROOM_LIST_DESCRIPTION;
    }
    return unorderedList(rooms.map(formatRoom));
}

function formatStatus(rooms: readonly IRoom[], guildConfig?: GuildConfig | null) {
    const lfgChannel = guildConfig?.lfgChannel
        ? channelMention(guildConfig.lfgChannel)
        : LfgConstants.LFG_NO_CHANNEL_CONFIGURED_DESCRIPTION;
    return [
        heading("Rooms", 3),
        formatList(rooms),
        heading("Server config", 3),
        unorderedList([`LFG channel: ${lfgChannel}`]),
    ].join("\n");
}

function formatRoom(room: IRoom) {
    return `${formatRoomCode(room.code)}: ${formatRoomPlayers(room)}`;
}

function formatRoomPlayers(room: IRoom) {
    return room.playerIds
        .toSorted((a, b) => (a === room.ownerId ? -1 : b === room.ownerId ? 1 : 0))
        .map((playerId) => `${userMention(playerId)}${playerId === room.ownerId ? ` (owner)` : ""}`)
        .join(", ");
}

function formatRoomCode(code: string) {
    return inlineCode(code);
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

export function mapLfgFeatureReturnToMessageBase({
    result,
    guildConfig,
}: {
    result: TLfgFeatureReturn;
    guildConfig?: GuildConfig | null;
}) {
    switch (result.kind) {
        case ELfgFeatureReturnKind.ROOMS_LISTED: {
            return createNeutralMessage({
                embed: { description: formatStatus(result.value.rooms, guildConfig) },
            });
        }
        case ELfgFeatureReturnKind.HELP:
            return createNeutralMessage({
                embed: { description: LfgConstants.LFG_HELP_DESCRIPTION },
            });
        case ELfgFeatureReturnKind.ROOM_CREATED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(result.value.userId)} created room ${formatRoomCode(result.value.room.code)}.`,
                },
            });
        case ELfgFeatureReturnKind.ROOM_JOINED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(result.value.userId)} joined room ${formatRoomCode(result.value.room.code)}.`,
                },
            });
        case ELfgFeatureReturnKind.OWNERSHIP_TRANSFERRED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(result.value.userId)} transferred ${formatRoomCode(result.value.room.code)}'s ownership to ${userMention(result.value.targetId)}.`,
                },
            });
        case ELfgFeatureReturnKind.PLAYER_KICKED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(result.value.userId)} kicked ${userMention(result.value.targetId)} from ${formatRoomCode(result.value.room.code)}.`,
                },
            });
        case ELfgFeatureReturnKind.ROOM_LEFT:
            return createPositiveMessage({
                embed: {
                    description: formatRoomLeft(result),
                },
            });
        case ELfgFeatureReturnKind.ROOM_DISBANDED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(result.value.userId)} disbanded ${formatRoomCode(result.value.code)}.`,
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
                    description: `Room ${formatRoomCode(result.value.code)} already exists.`,
                },
            });
        case ELfgFeatureReturnKind.ROOM_NOT_FOUND:
            return createNegativeMessage({
                embed: {
                    description: `Room ${formatRoomCode(result.value.code)} does not exist.`,
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
                    description: `Room ${formatRoomCode(result.value.code)} already has ${LfgConstants.LFG_MAX_ROOM_PLAYERS} players.`,
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
                    description: `${userMention(result.value.targetId)} is not in your room.`,
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

export function mapLfgMessageBaseToReply({
    messageBase,
    interaction,
    guildConfig,
}: {
    messageBase: ReturnType<typeof mapLfgFeatureReturnToMessageBase>;
    // Using Pick before of PickDeep to avoid "type too complex" error
    interaction: PickDeep<
        Pick<ChatInputCommandInteraction, "options" | "channelId">,
        "options.getBoolean" | "channelId"
    >;
    guildConfig: GuildConfig | null;
}) {
    const displayToEveryone = interaction.options.getBoolean(LFG_SHOW_RESPONSE_OPTION_NAME, false);

    if (
        displayToEveryone ||
        (messageBase.kind === EMessageKind.POSITIVE && interaction.channelId === guildConfig?.lfgChannel)
    ) {
        return messageBase;
    }
    return { ...messageBase, flags: [MessageFlags.Ephemeral] } as const;
}
