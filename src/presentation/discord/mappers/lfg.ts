import type { ChatInputCommandInteraction } from "discord.js";
import {
    bold,
    channelMention,
    heading,
    inlineCode,
    italic,
    MessageFlags,
    roleMention,
    time,
    unorderedList,
    userMention,
} from "discord.js";
import type { PickDeep } from "type-fest";
import type { TLfgResultOfKind, TLfgStatusGuildConfig } from "../../../application/lfg/types.ts";
import { ELfgResultKind, type TLfgResult } from "../../../application/lfg/types.ts";
import {
    AMOUNT_OF_PLAYERS_IN_A_BATTLE,
    FRIEND_BATTLE_CODE_MAXIMUM_LENGTH,
    FRIEND_BATTLE_CODE_MINIMUM_LENGTH,
} from "../../../domain/game/constants.ts";
import { ELfgPlayerRemovalKind } from "../../../domain/lfg/models/playerRemoval.types.ts";
import type { IRoom } from "../../../domain/lfg/models/room.types.ts";
import formatCommand from "../commands/formatCommand.ts";
import {
    LFG_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_CANNOT_PING_EVERYONE_DESCRIPTION,
    LFG_COMMAND_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_ROLE_NOT_CONFIGURED_DESCRIPTION,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
    LFG_SHOW_RESPONSE_OPTION_NAME,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "../commands/lfg/constants.ts";
import { createErrorMessage, createNegativeMessage, createNeutralMessage, createPositiveMessage } from "../message.ts";
import { EMessageKind } from "../message.types.ts";

const LFG_NOT_CONFIGURED_DESCRIPTION = italic("Not configured");

const LFG_HELP_DESCRIPTION = `${formatCommand([LFG_COMMAND_NAME])} groups subcommands for managing ${bold("rooms")} for Friend Battles.

Rooms:
${unorderedList([
    `are groups of up to ${AMOUNT_OF_PLAYERS_IN_A_BATTLE} players,`,
    `have a code which should be used in Friend Battles,`,
    `have an ${bold("owner")} with additional privileges within the group.`,
])}

Want to play? First check ${formatCommand([LFG_COMMAND_NAME, LFG_STATUS_SUBCOMMAND_NAME])} for vacant spots in existing rooms. Ask active players whether you can join them!

Use ${formatCommand([LFG_COMMAND_NAME, LFG_JOIN_SUBCOMMAND_NAME])} to join a room, or ${formatCommand([LFG_COMMAND_NAME, LFG_CREATE_SUBCOMMAND_NAME])} to create one as the owner.

Still missing players? Use ${formatCommand([LFG_COMMAND_NAME, LFG_PING_SUBCOMMAND_NAME])} to ping users who have a role dedicated to LFG.
${formatCommand([LFG_COMMAND_NAME, LFG_PING_SUBCOMMAND_NAME])} enters a cooldown period for the pinged role after use.

When you are done playing, use ${formatCommand([LFG_COMMAND_NAME, LFG_LEAVE_SUBCOMMAND_NAME])} so other players can see that you are not playing anymore.

In general, please encourage each other to ensure that ${formatCommand([LFG_COMMAND_NAME, LFG_STATUS_SUBCOMMAND_NAME])}'s output is always up-to-date.

A room owner may also use the following commands:
${unorderedList([
    `${formatCommand([LFG_COMMAND_NAME, LFG_DISBAND_SUBCOMMAND_NAME])}: Delete their room.`,
    `${formatCommand([LFG_COMMAND_NAME, LFG_CHANGE_CODE_SUBCOMMAND_NAME])}: Change their room's code.`,
    `${formatCommand([LFG_COMMAND_NAME, LFG_KICK_SUBCOMMAND_NAME])}: Kick a player from their room.`,
    `${formatCommand([LFG_COMMAND_NAME, LFG_TRANSFER_SUBCOMMAND_NAME])}: Transfer ownership to another player in their room.`,
])}

Ownership is automatically transferred when the owner leaves the room.
Rooms are deleted when all players leave.

${formatCommand([LFG_COMMAND_NAME])} subcommands may be used in any channel without fear of spamming as all responses are visible to the user only.

${formatCommand([LFG_COMMAND_NAME, LFG_STATUS_SUBCOMMAND_NAME])} also displays the server's config for the LFG feature as set by admins:
${unorderedList([
    `${bold("LFG channel")}: channel to which will be sent a public copy of all responses returned by ${formatCommand([LFG_COMMAND_NAME])} subcommands following successful execution.`,
    `${bold("LFG roles")}: roles which may be pinged by ${formatCommand([LFG_COMMAND_NAME, LFG_PING_SUBCOMMAND_NAME])}.`,
    `${bold("LFG roles ping cooldown")}: time between pings for each role.`,
])}

Have fun!!`;

export function createLfgHelpMessageBase() {
    return createNeutralMessage({
        embed: { description: LFG_HELP_DESCRIPTION },
    });
}

export function createInvalidLfgSubcommandMessageBase() {
    return createErrorMessage({
        embed: {
            description: "Please specify a valid subcommand.",
        },
    });
}

/** Role config fields needed to render one pingable role's status. */
type LfgRoleStatus = {
    // TODO: `Date | string | null` because the Mikro-ORM model uses string for date fields
    // I believe this is a symptom of needing to map the Mikro-ORM model to some other representation for use in the LFG feature.
    readonly lastPingedAt?: Date | string | null;
    readonly role: string;
};

/** Guild config fields needed to render the LFG status output. */
type LfgStatusGuildConfig = Pick<TLfgStatusGuildConfig, "lfgChannel" | "lfgRolePingCooldownMinutes"> & {
    readonly lfgRoles?: Iterable<LfgRoleStatus>;
};

/** Guild config fields needed to decide whether an LFG reply should be public. */
type LfgReplyGuildConfig = {
    readonly lfgChannel: string | null;
};

function formatList(rooms: readonly IRoom[]) {
    if (rooms.length === 0) {
        return "No active rooms. :(";
    }
    return unorderedList(rooms.map(formatRoom));
}

/** Formats one pingable role with its current ping cooldown state. */
function formatLfgRoleStatus(lfgRole: LfgRoleStatus, cooldownMs: number, now: Date) {
    const pingableAt = lfgRole.lastPingedAt ? new Date(new Date(lfgRole.lastPingedAt).getTime() + cooldownMs) : null;
    const cooldownStatus =
        pingableAt && pingableAt.getTime() > now.getTime() ? `pingable on ${time(pingableAt)}` : "pingable immediately";

    return `${roleMention(lfgRole.role)} (${cooldownStatus})`;
}

/** Formats pingable LFG roles as missing config text or nested status list entries. */
function formatLfgRoles(guildConfig?: LfgStatusGuildConfig | null) {
    const lfgRoles = guildConfig?.lfgRoles ? Array.from(guildConfig.lfgRoles) : [];
    if (lfgRoles.length === 0) {
        return LFG_NOT_CONFIGURED_DESCRIPTION;
    }

    const cooldownMs = (guildConfig?.lfgRolePingCooldownMinutes ?? 0) * 60 * 1000;
    const now = new Date();
    return lfgRoles.map((lfgRole) => formatLfgRoleStatus(lfgRole, cooldownMs, now));
}

function formatStatus(rooms: readonly IRoom[], guildConfig?: LfgStatusGuildConfig | null) {
    const lfgChannel = guildConfig?.lfgChannel
        ? channelMention(guildConfig.lfgChannel)
        : LFG_NOT_CONFIGURED_DESCRIPTION;
    const lfgRoles = formatLfgRoles(guildConfig);
    const lfgRolesListItem = Array.isArray(lfgRoles) ? ["LFG roles:", lfgRoles] : [`LFG roles: ${lfgRoles}`];
    const lfgRolePingCooldown =
        guildConfig?.lfgRolePingCooldownMinutes != null
            ? `${guildConfig.lfgRolePingCooldownMinutes} minutes`
            : LFG_NOT_CONFIGURED_DESCRIPTION;
    return [
        heading("Rooms", 3),
        formatList(rooms),
        heading("Server config", 3),
        unorderedList([
            `LFG channel: ${lfgChannel}`,
            ...lfgRolesListItem,
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
        .map((playerId) => `${userMention(playerId)}${playerId === room.ownerId ? ` (owner)` : ""}`)
        .join(", ");
}

function formatRoomCode(code: string) {
    return inlineCode(code);
}

function formatRoomCreated(callerId: string, userId: string, room: IRoom) {
    if (callerId !== userId) {
        return `${userMention(callerId)} created room ${formatRoomCode(room.code)} with ${userMention(userId)} as owner.`;
    }
    return `${userMention(userId)} created room ${formatRoomCode(room.code)}.`;
}

function formatRoomCodeChanged(callerId: string, oldCode: string, newCode: string) {
    return `${userMention(callerId)} changed room ${formatRoomCode(oldCode)}'s code to ${formatRoomCode(newCode)}.`;
}

function formatRoomJoined(
    callerId: string,
    userId: string,
    room: IRoom,
    leftRoomCode?: string,
    removalResult?: TLfgResultOfKind<ELfgResultKind.ROOM_JOINED>["value"]["removalResult"],
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
    removalResult: TLfgResultOfKind<ELfgResultKind.PLAYER_KICKED>["value"]["removalResult"],
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

function formatRoomLeft(arg: TLfgResultOfKind<ELfgResultKind.ROOM_LEFT>) {
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

function formatAlreadyInRoom(callerId: string, userId: string) {
    if (callerId === userId) {
        return "Leave your current room before creating a new one.";
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
        return "Choose another player in your room.";
    }
    return `${userMention(userId)} already owns room ${formatRoomCode(code)}.`;
}

function formatPlayerNotInRoom(callerId: string, ownerId: string, targetId: string, code: string) {
    if (callerId !== ownerId) {
        return `${userMention(targetId)} is not in room ${formatRoomCode(code)}.`;
    }
    return `${userMention(targetId)} is not in your room.`;
}

export function mapLfgResultToMessageBase({ result, callerId }: { result: TLfgResult; callerId: string }) {
    switch (result.kind) {
        case ELfgResultKind.ROOMS_LISTED: {
            return createNeutralMessage({
                embed: { description: formatStatus(result.value.rooms, result.value.guildConfig) },
            });
        }
        case ELfgResultKind.ROOM_CREATED:
            return createPositiveMessage({
                embed: {
                    description: formatRoomCreated(callerId, result.value.userId, result.value.room),
                },
            });
        case ELfgResultKind.ROOM_CODE_CHANGED:
            return createPositiveMessage({
                embed: {
                    description: formatRoomCodeChanged(callerId, result.value.oldCode, result.value.newCode),
                },
            });
        case ELfgResultKind.ROOM_JOINED:
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
        case ELfgResultKind.OWNERSHIP_TRANSFERRED:
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
        case ELfgResultKind.PLAYER_KICKED:
            return createPositiveMessage({
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
        case ELfgResultKind.ROOM_LEFT:
            return createPositiveMessage({
                embed: {
                    description: formatRoomLeft(result),
                },
            });
        case ELfgResultKind.ROOM_DISBANDED:
            return createPositiveMessage({
                embed: {
                    description: `${userMention(callerId)} disbanded ${formatRoomCode(result.value.code)}.`,
                },
            });
        case ELfgResultKind.HELP_REQUESTED:
            return createLfgHelpMessageBase();
        case ELfgResultKind.LFG_ROLE_PINGED:
            return createPositiveMessage({
                content: `${roleMention(result.value.roleId)} people, ${userMention(result.value.userId)} is looking for a room!`,
                allowedMentions: { roles: [result.value.roleId], users: [result.value.userId] },
                embed: { description: `${userMention(result.value.userId)} is looking for a room!` },
            });
        case ELfgResultKind.INVALID_ROOM_CODE:
            return createNegativeMessage({
                embed: {
                    description: `Room codes must be between ${FRIEND_BATTLE_CODE_MINIMUM_LENGTH} and ${FRIEND_BATTLE_CODE_MAXIMUM_LENGTH} characters.`,
                },
            });
        case ELfgResultKind.ALREADY_IN_A_ROOM:
            return createNegativeMessage({
                embed: {
                    description: formatAlreadyInRoom(callerId, result.value.userId),
                },
            });
        case ELfgResultKind.ROOM_ALREADY_EXISTS:
            return createNegativeMessage({
                embed: {
                    description: `Room ${formatRoomCode(result.value.code)} already exists.`,
                },
            });
        case ELfgResultKind.ROOM_NOT_FOUND:
            return createNegativeMessage({
                embed: {
                    description: `Room ${formatRoomCode(result.value.code)} does not exist.`,
                },
            });
        case ELfgResultKind.ALREADY_IN_TARGET_ROOM:
            return createNegativeMessage({
                embed: {
                    description: formatAlreadyInTargetRoom(callerId, result.value.userId, result.value.room),
                },
            });
        case ELfgResultKind.ROOM_IS_FULL:
            return createNegativeMessage({
                embed: {
                    description: `Room ${formatRoomCode(result.value.code)} already has ${AMOUNT_OF_PLAYERS_IN_A_BATTLE} players.`,
                },
            });
        case ELfgResultKind.CANNOT_TRANSFER_TO_YOURSELF:
            return createNegativeMessage({
                embed: {
                    description: formatCannotTransferToCurrentOwner(callerId, result.value.userId, result.value.code),
                },
            });
        case ELfgResultKind.PLAYER_NOT_IN_ROOM:
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
        case ELfgResultKind.NOT_ROOM_OWNER:
            return createNegativeMessage({
                embed: {
                    description: "Only the room owner can do that.",
                },
            });
        case ELfgResultKind.CANNOT_KICK_YOURSELF:
            return createNegativeMessage({
                embed: {
                    description: `Use ${inlineCode(`${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}`)} to leave your room.`,
                },
            });
        case ELfgResultKind.NOT_IN_A_ROOM:
            return createNegativeMessage({
                embed: { description: "Join or create a room first." },
            });
        case ELfgResultKind.LFG_CHANNEL_NOT_FOUND:
            return createNegativeMessage({
                embed: { description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION },
            });
        case ELfgResultKind.LFG_ROLE_CANNOT_BE_EVERYONE:
            return createNegativeMessage({
                embed: { description: LFG_CANNOT_PING_EVERYONE_DESCRIPTION },
            });
        case ELfgResultKind.LFG_ROLE_NOT_CONFIGURED:
            return createNegativeMessage({
                embed: { description: LFG_ROLE_NOT_CONFIGURED_DESCRIPTION },
            });
        case ELfgResultKind.LFG_ROLE_NOT_FOUND:
            return createNegativeMessage({
                embed: { description: LFG_ROLE_TO_PING_DELETED_DESCRIPTION },
            });
        case ELfgResultKind.LFG_ROLE_ON_COOLDOWN:
            return createNegativeMessage({
                embed: {
                    description: `${roleMention(result.value.roleId)} can be pinged again on ${time(result.value.nextPingAt)}.`,
                },
            });
    }
}

export function mapLfgMessageBaseToReply({
    messageBase,
    interaction,
    guildConfig,
}: {
    messageBase: ReturnType<typeof mapLfgResultToMessageBase>;
    // Using Pick before of PickDeep to avoid "type too complex" error
    interaction: PickDeep<
        Pick<ChatInputCommandInteraction, "options" | "channelId">,
        "options.getBoolean" | "channelId"
    >;
    guildConfig: LfgReplyGuildConfig | null;
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
