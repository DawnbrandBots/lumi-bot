import { heading, HeadingLevel, inlineCode, italic, unorderedList, userMention } from "discord.js";
import * as constants from "../../../../../../src/domain/game/constants.ts";
import type { IRoom } from "../../../../../../src/domain/lfg/models/room.types.ts";
import { LFG_SHOW_RESPONSE_OPTION_NAME } from "../../../../../../src/presentation/discord/commands/lfg/constants.ts";

export const ROOM: IRoom = {
    code: "alpha",
    ownerId: "owner",
    playerIds: ["player-1", "owner", "player-2"],
};

export const PUBLIC_CHANNEL_ID = "public-channel";
export const PINGABLE_ROLE_ID = "pingable-role";
export const COOLDOWN_ROLE_ID = "cooldown-role";
export const COOLDOWN_ROLE_LAST_PINGED_AT = new Date("2026-07-19T09:30:00.000Z");
export const STATUS_NOW = new Date("2026-07-19T10:00:00.000Z");

export const GUILD_CONFIG = {
    guild: "guild-1",
    lfgChannel: PUBLIC_CHANNEL_ID,
    lfgRolePingCooldownMinutes: 45,
    lfgRoles: [
        { role: PINGABLE_ROLE_ID, lastPingedAt: null },
        { role: COOLDOWN_ROLE_ID, lastPingedAt: COOLDOWN_ROLE_LAST_PINGED_AT },
    ],
};

export const LfgConstants = {
    LFG_NOT_CONFIGURED_DESCRIPTION: italic("Not configured"),
    LFG_EMPTY_ROOM_LIST_DESCRIPTION: "No active rooms. :(",
    LFG_INVALID_ROOM_CODE_DESCRIPTION: `Room codes must be between ${constants.FRIEND_BATTLE_CODE_MINIMUM_LENGTH} and ${constants.FRIEND_BATTLE_CODE_MAXIMUM_LENGTH} characters.`,
    LFG_ALREADY_IN_A_ROOM_DESCRIPTION: "Leave your current room before creating a new one.",
    LFG_CANNOT_TRANSFER_TO_YOURSELF_DESCRIPTION: "Choose another player in your room.",
    LFG_NOT_ROOM_OWNER_DESCRIPTION: "Only the room owner can do that.",
    LFG_CANNOT_KICK_YOURSELF_DESCRIPTION: `Use ${inlineCode("lfg leave")} to leave your room.`,
    LFG_NOT_IN_A_ROOM_DESCRIPTION: "Join or create a room first.",
    LFG_SHOW_RESPONSE_OPTION_NAME,
} as const;

export function statusDescription({
    roomsDescription,
    lfgChannel,
    lfgRoles = LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION,
    lfgRolePingCooldownMinutes = null,
}: {
    readonly roomsDescription: string;
    readonly lfgChannel: string;
    readonly lfgRoles?: string | readonly string[];
    readonly lfgRolePingCooldownMinutes?: number | null;
}) {
    const lfgRolesDescription = typeof lfgRoles === "string" ? [`LFG roles: ${lfgRoles}`] : ["LFG roles:", lfgRoles];
    return [
        heading("Rooms", HeadingLevel.Three),
        roomsDescription,
        heading("Server config", HeadingLevel.Three),
        unorderedList([
            `LFG channel: ${lfgChannel}`,
            ...lfgRolesDescription,
            `LFG roles ping cooldown: ${
                lfgRolePingCooldownMinutes != null
                    ? `${lfgRolePingCooldownMinutes} minutes`
                    : LfgConstants.LFG_NOT_CONFIGURED_DESCRIPTION
            }`,
        ]),
    ].join("\n");
}

export function roomDescription(room: IRoom) {
    return `${inlineCode(room.code)}: ${userMention(room.ownerId)} (owner), ${userMention("player-1")}, ${userMention("player-2")}`;
}
