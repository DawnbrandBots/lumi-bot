import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    PermissionFlagsBits,
} from "discord.js";
import {
    FRIEND_BATTLE_CODE_MAXIMUM_LENGTH,
    FRIEND_BATTLE_CODE_MINIMUM_LENGTH,
} from "../../../domain/game/constants.ts";
import { LFG_CODE_OPTION_NAME, LFG_NEW_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../commands/lfg/constants.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_COMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "../commands/lfgManage/constants.ts";
import type { ICommandCommandRegistrationData } from "../commands/types.ts";

const playerOption = {
    type: ApplicationCommandOptionType.User,
    name: LFG_PLAYER_OPTION_NAME,
    description: "Player.",
    required: true,
} as const;

const roomCodeOption = {
    type: ApplicationCommandOptionType.String,
    name: LFG_CODE_OPTION_NAME,
    description: "Room code.",
    min_length: FRIEND_BATTLE_CODE_MINIMUM_LENGTH,
    max_length: FRIEND_BATTLE_CODE_MAXIMUM_LENGTH,
    required: true,
} as const;

const autocompletedRoomCodeOption = {
    ...roomCodeOption,
    autocomplete: true,
} as const;

const newRoomCodeOption = {
    ...roomCodeOption,
    name: LFG_NEW_CODE_OPTION_NAME,
    description: "New room code.",
} as const;

export const lfgManageCommandCommandRegistrationData = {
    name: LFG_MANAGE_COMMAND_NAME,
    description: "Manage looking-for-game rooms for all server members.",
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
            description: "Create a room for a player.",
            options: [{ ...playerOption, description: "Room owner." }, roomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
            description: "Move a player to a room.",
            options: [{ ...playerOption, description: "Player to move." }, autocompletedRoomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
            description: "Change a room's code.",
            options: [autocompletedRoomCodeOption, newRoomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_KICK_SUBCOMMAND_NAME,
            description: "Kick a player from their room.",
            options: [{ ...playerOption, description: "Player to kick." }, autocompletedRoomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
            description: "Transfer room ownership.",
            options: [{ ...playerOption, description: "New room owner." }, autocompletedRoomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
            description: "Disband a room.",
            options: [autocompletedRoomCodeOption],
        },
    ],
} as const satisfies ICommandCommandRegistrationData;
