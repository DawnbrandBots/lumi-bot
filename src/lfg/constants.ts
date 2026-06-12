export const LFG_COMMAND_NAME = "lfg";
export const LFG_CODE_OPTION_NAME = "code";
export const LFG_PLAYER_OPTION_NAME = "player";

export const LFG_CREATE_SUBCOMMAND_NAME = "create";
export const LFG_JOIN_SUBCOMMAND_NAME = "join";
export const LFG_TRANSFER_SUBCOMMAND_NAME = "transfer";
export const LFG_KICK_SUBCOMMAND_NAME = "kick";
export const LFG_LEAVE_SUBCOMMAND_NAME = "leave";
export const LFG_QUEUE_SUBCOMMAND_NAME = "queue";
export const LFG_DISBAND_SUBCOMMAND_NAME = "disband";
export const LFG_STATUS_SUBCOMMAND_NAME = "status";
export const LFG_HELP_SUBCOMMAND_NAME = "help";

export const LFG_CREATE_SUBCOMMAND_DESCRIPTION = "Create a room.";
export const LFG_JOIN_SUBCOMMAND_DESCRIPTION = "Join a room.";
export const LFG_TRANSFER_SUBCOMMAND_DESCRIPTION = "Transfer room ownership.";
export const LFG_KICK_SUBCOMMAND_DESCRIPTION = "Kick a player from your room.";
export const LFG_LEAVE_SUBCOMMAND_DESCRIPTION = "Leave your current room.";
export const LFG_QUEUE_SUBCOMMAND_DESCRIPTION = "Join the queue.";
export const LFG_DISBAND_SUBCOMMAND_DESCRIPTION = "Disband your current room.";
export const LFG_STATUS_SUBCOMMAND_DESCRIPTION = "Display queued players and active rooms.";
export const LFG_HELP_SUBCOMMAND_DESCRIPTION = "Display LFG commands.";

export const LFG_MIN_ROOM_CODE_LENGTH = 1;
export const LFG_MAX_ROOM_CODE_LENGTH = 8;
export const LFG_MAX_ROOM_PLAYERS = 3;

export const LFG_EMPTY_ROOM_LIST_DESCRIPTION = "No active rooms. :(";
export const LFG_EMPTY_QUEUE_LIST_DESCRIPTION = "No players in queue. :(";
export const LFG_QUEUE_LIST_TITLE = "Queue";
export const LFG_ROOM_LIST_TITLE = "Rooms";
export const LFG_ROOM_OWNER_LABEL = "owner";
export const LFG_ROOM_CODE_MARKER = "`";

export const LFG_INVALID_ROOM_CODE_DESCRIPTION = `Room codes must be between ${LFG_MIN_ROOM_CODE_LENGTH} and ${LFG_MAX_ROOM_CODE_LENGTH} characters.`;
export const LFG_ALREADY_IN_A_ROOM_DESCRIPTION = "Leave your current room before creating a new one.";
export const LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION = "Choose another player in your room.";
export const LFG_NOT_ROOM_OWNER_DESCRIPTION = "Only the room owner can do that.";
export const LFG_CANNOT_KICK_YOURSELF_DESCRIPTION = `Use ${LFG_ROOM_CODE_MARKER}/${LFG_COMMAND_NAME} ${LFG_LEAVE_SUBCOMMAND_NAME}${LFG_ROOM_CODE_MARKER} to leave your room.`;
export const LFG_NOT_IN_A_ROOM_DESCRIPTION = "Join, create, or queue first.";
export const LFG_ALREADY_IN_QUEUE_DESCRIPTION = "You are already in the queue.";
export const LFG_INVALID_SUBCOMMAND_DESCRIPTION = "Please specify a valid subcommand.";
