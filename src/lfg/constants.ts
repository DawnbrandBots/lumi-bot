export const LFG_COMMAND_NAME = "lfg";
export const LFG_CODE_OPTION_NAME = "code";
export const LFG_PLAYER_OPTION_NAME = "player";

export const LFG_CREATE_SUBCOMMAND_NAME = "create";
export const LFG_JOIN_SUBCOMMAND_NAME = "join";
export const LFG_TRANSFER_SUBCOMMAND_NAME = "transfer";
export const LFG_KICK_SUBCOMMAND_NAME = "kick";
export const LFG_LEAVE_SUBCOMMAND_NAME = "leave";
export const LFG_DISBAND_SUBCOMMAND_NAME = "disband";
export const LFG_LIST_SUBCOMMAND_NAME = "list";
export const LFG_HELP_SUBCOMMAND_NAME = "help";
export const LFG_PING_SUBCOMMAND_NAME = "ping";

export const LFG_CREATE_SUBCOMMAND_DESCRIPTION = "Create a room.";
export const LFG_JOIN_SUBCOMMAND_DESCRIPTION = "Join a room.";
export const LFG_TRANSFER_SUBCOMMAND_DESCRIPTION = "Transfer room ownership.";
export const LFG_KICK_SUBCOMMAND_DESCRIPTION = "Kick a player from your room.";
export const LFG_LEAVE_SUBCOMMAND_DESCRIPTION = "Leave your current room.";
export const LFG_DISBAND_SUBCOMMAND_DESCRIPTION = "Disband your current room.";
export const LFG_LIST_SUBCOMMAND_DESCRIPTION = "Display active rooms.";
export const LFG_HELP_SUBCOMMAND_DESCRIPTION = "Display LFG commands.";
export const LFG_PING_SUBCOMMAND_DESCRIPTION = "Ping the configured LFG role.";

export const LFG_MIN_ROOM_CODE_LENGTH = 1;
export const LFG_MAX_ROOM_CODE_LENGTH = 8;
export const LFG_MAX_ROOM_PLAYERS = 3;

export const LFG_EMPTY_ROOM_LIST_DESCRIPTION = "No active rooms. :(";
export const LFG_ROOM_OWNER_LABEL = "owner";
export const LFG_ROOM_CODE_MARKER = "`";

export const LFG_INVALID_ROOM_CODE_DESCRIPTION = `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`;
export const LFG_ALREADY_IN_A_ROOM_DESCRIPTION = "Leave your current room before creating a new one.";
export const LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION = "Choose another player in your room.";
export const LFG_NOT_ROOM_OWNER_DESCRIPTION = "Only the room owner can do that.";
export const LFG_CANNOT_KICK_YOURSELF_DESCRIPTION = `Use ${LFG_ROOM_CODE_MARKER}/${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}${LFG_ROOM_CODE_MARKER} to leave your room.`;
export const LFG_NOT_IN_A_ROOM_DESCRIPTION = "Join or create a room first.";
export const LFG_INVALID_SUBCOMMAND_DESCRIPTION = "Please specify a valid subcommand.";
export const LFG_NO_ROLE_TO_PING_DESCRIPTION = "No role was set to be pinged.";
export const LFG_NO_CHANNEL_TO_PING_DESCRIPTION = "LFG channel does not exist.";
export const LFG_ROLE_TO_PING_DELETED_DESCRIPTION = "Role to ping appears to no longer exist.";
export const LFG_ROLE_PINGED_DESCRIPTION = "LFG role pinged.";

export const LFG_ROLE_PING_COOLDOWN_MS = 30 * 60 * 1000;
