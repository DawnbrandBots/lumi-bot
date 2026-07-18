import { bold, inlineCode, unorderedList } from "discord.js";
import formatCommand from "./utils/formatCommand.ts";

export const LFG_COMMAND_NAME = "lfg";
export const LFG_CODE_OPTION_NAME = "code";
export const LFG_PLAYER_OPTION_NAME = "player";
export const LFG_ROLE_OPTION_NAME = "role";
export const LFG_SHOW_RESPONSE_OPTION_NAME = "show_response";

export const LFG_CREATE_SUBCOMMAND_NAME = "create";
export const LFG_JOIN_SUBCOMMAND_NAME = "join";
export const LFG_TRANSFER_SUBCOMMAND_NAME = "transfer";
export const LFG_KICK_SUBCOMMAND_NAME = "kick";
export const LFG_LEAVE_SUBCOMMAND_NAME = "leave";
export const LFG_DISBAND_SUBCOMMAND_NAME = "disband";
export const LFG_STATUS_SUBCOMMAND_NAME = "status";
export const LFG_HELP_SUBCOMMAND_NAME = "help";
export const LFG_PING_SUBCOMMAND_NAME = "ping";

export const LFG_CREATE_SUBCOMMAND_DESCRIPTION = "Create a room.";
export const LFG_JOIN_SUBCOMMAND_DESCRIPTION = "Join a room.";
export const LFG_TRANSFER_SUBCOMMAND_DESCRIPTION = "Transfer room ownership.";
export const LFG_KICK_SUBCOMMAND_DESCRIPTION = "Kick a player from your room.";
export const LFG_LEAVE_SUBCOMMAND_DESCRIPTION = "Leave your current room.";
export const LFG_DISBAND_SUBCOMMAND_DESCRIPTION = "Disband your current room.";
export const LFG_STATUS_SUBCOMMAND_DESCRIPTION = "Display active rooms.";
export const LFG_HELP_SUBCOMMAND_DESCRIPTION = "Display LFG commands.";
export const LFG_PING_SUBCOMMAND_DESCRIPTION = "Ping one LFG role.";

export const LFG_MIN_ROOM_CODE_LENGTH = 1;
export const LFG_MAX_ROOM_CODE_LENGTH = 8;
export const LFG_MAX_ROOM_PLAYERS = 3;

export const LFG_EMPTY_ROOM_LIST_DESCRIPTION = "No active rooms. :(";
export const LFG_NOT_CONFIGURED_DESCRIPTION = "Not configured";
export const LFG_NO_CHANNEL_CONFIGURED_DESCRIPTION = "Not configured";

export const LFG_INVALID_ROOM_CODE_DESCRIPTION = `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`;
export const LFG_ALREADY_IN_A_ROOM_DESCRIPTION = "Leave your current room before creating a new one.";
export const LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION = "Choose another player in your room.";
export const LFG_NOT_ROOM_OWNER_DESCRIPTION = "Only the room owner can do that.";
export const LFG_CANNOT_KICK_YOURSELF_DESCRIPTION = `Use ${inlineCode(`${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}`)} to leave your room.`;
export const LFG_NOT_IN_A_ROOM_DESCRIPTION = "Join or create a room first.";
export const LFG_INVALID_SUBCOMMAND_DESCRIPTION = "Please specify a valid subcommand.";
export const LFG_NO_ROLE_TO_PING_DESCRIPTION = "No role was set to be pinged.";
export const LFG_NO_CHANNEL_TO_PING_DESCRIPTION = "LFG channel does not exist.";
export const LFG_CANNOT_PING_EVERYONE_DESCRIPTION = "`@everyone` cannot be pinged by LFG.";
export const LFG_ROLE_NOT_CONFIGURED_DESCRIPTION = "This role is not configured for LFG pings.";
export const LFG_ROLE_TO_PING_DELETED_DESCRIPTION = "Role to ping appears to no longer exist.";
export const LFG_ROLE_PINGED_DESCRIPTION = "LFG role pinged.";

export const LFG_ROLE_PING_MINIMUM_COOLDOWN_MINUTES = 0;

export const LFG_HELP_DESCRIPTION = `${formatCommand([LFG_COMMAND_NAME])} groups subcommands for managing ${bold("rooms")} for Friend Battles.

Rooms:
${unorderedList([
    `are groups of up to ${LFG_MAX_ROOM_PLAYERS} players,`,
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
