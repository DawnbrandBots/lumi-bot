import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import type { ICommandApiInfo } from "../../bot/commands/types.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CHANGE_CODE_SUBCOMMAND_DESCRIPTION,
    LFG_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_COMMAND_NAME,
    LFG_CREATE_SUBCOMMAND_DESCRIPTION,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_DESCRIPTION,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_DESCRIPTION,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_DESCRIPTION,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_DESCRIPTION,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_DESCRIPTION,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_MAX_ROOM_CODE_LENGTH,
    LFG_MIN_ROOM_CODE_LENGTH,
    LFG_PING_SUBCOMMAND_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_ROLE_OPTION_NAME,
    LFG_SHOW_RESPONSE_OPTION_NAME,
    LFG_STATUS_SUBCOMMAND_DESCRIPTION,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_DESCRIPTION,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "../constants.ts";

const roomCodeOption = {
    type: ApplicationCommandOptionType.String,
    name: LFG_CODE_OPTION_NAME,
    description: "Room code.",
    min_length: LFG_MIN_ROOM_CODE_LENGTH,
    max_length: LFG_MAX_ROOM_CODE_LENGTH,
    required: true,
} as const;

const playerOption = {
    type: ApplicationCommandOptionType.User,
    name: LFG_PLAYER_OPTION_NAME,
    description: "Player.",
    required: true,
} as const;

export const lfgCommandApiInfo = {
    name: LFG_COMMAND_NAME,
    description: "Create and join looking-for-game rooms for playing with other server members.",
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_CREATE_SUBCOMMAND_NAME,
            description: LFG_CREATE_SUBCOMMAND_DESCRIPTION,
            options: [roomCodeOption],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_CHANGE_CODE_SUBCOMMAND_NAME,
            description: LFG_CHANGE_CODE_SUBCOMMAND_DESCRIPTION,
            options: [{ ...roomCodeOption, description: "New room code." }],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_JOIN_SUBCOMMAND_NAME,
            description: LFG_JOIN_SUBCOMMAND_DESCRIPTION,
            options: [{ ...roomCodeOption, autocomplete: true }],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_TRANSFER_SUBCOMMAND_NAME,
            description: LFG_TRANSFER_SUBCOMMAND_DESCRIPTION,
            options: [{ ...playerOption, description: "New room owner." }],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_KICK_SUBCOMMAND_NAME,
            description: LFG_KICK_SUBCOMMAND_DESCRIPTION,
            options: [{ ...playerOption, description: "Player to kick." }],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_LEAVE_SUBCOMMAND_NAME,
            description: LFG_LEAVE_SUBCOMMAND_DESCRIPTION,
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_DISBAND_SUBCOMMAND_NAME,
            description: LFG_DISBAND_SUBCOMMAND_DESCRIPTION,
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_STATUS_SUBCOMMAND_NAME,
            description: LFG_STATUS_SUBCOMMAND_DESCRIPTION,
            options: [
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: LFG_SHOW_RESPONSE_OPTION_NAME,
                    description: "Show response to everyone. false by default.",
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_HELP_SUBCOMMAND_NAME,
            description: LFG_HELP_SUBCOMMAND_DESCRIPTION,
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: LFG_PING_SUBCOMMAND_NAME,
            description: LFG_PING_SUBCOMMAND_DESCRIPTION,
            options: [
                {
                    type: ApplicationCommandOptionType.Role,
                    name: LFG_ROLE_OPTION_NAME,
                    description: "LFG role to ping.",
                    required: true,
                },
            ],
        },
    ],
} as const satisfies ICommandApiInfo;
