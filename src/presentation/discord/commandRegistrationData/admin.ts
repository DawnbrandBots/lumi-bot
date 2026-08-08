import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    ChannelType,
    InteractionContextType,
    PermissionFlagsBits,
    type APIApplicationCommandStringOption,
} from "discord.js";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_COMMAND_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
    ADMIN_MINUTES_OPTION_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "../../../admin/constants.ts";
import type { ICommandCommandRegistrationData } from "../../../bot/commands/types.ts";
import { LFG_ROLE_PING_MINIMUM_COOLDOWN_MINUTES } from "../../../lfg/constants.ts";

const setOrClearActionOption = {
    type: ApplicationCommandOptionType.String,
    name: ADMIN_ACTION_OPTION_NAME,
    description: "Config action.",
    required: false,
    choices: [
        { name: ADMIN_ACTION_SET, value: ADMIN_ACTION_SET },
        { name: ADMIN_ACTION_CLEAR, value: ADMIN_ACTION_CLEAR },
    ],
} as const satisfies APIApplicationCommandStringOption;

export const adminCommandCommandRegistrationData = {
    name: ADMIN_COMMAND_NAME,
    description: "Configure Lumi for this server.",
    contexts: [InteractionContextType.Guild],
    integration_types: [ApplicationIntegrationType.GuildInstall],
    default_member_permissions: PermissionFlagsBits.ManageGuild.toString(),
    options: [
        {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: ADMIN_LFG_GROUP_NAME,
            description: "Configure LFG.",
            options: [
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
                    description: "Configure the LFG public channel.",
                    options: [
                        setOrClearActionOption,
                        {
                            type: ApplicationCommandOptionType.Channel,
                            name: ADMIN_CHANNEL_OPTION_NAME,
                            description: "Guild text channel.",
                            required: false,
                            channel_types: [ChannelType.GuildText],
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
                    description: "Configure the LFG ping role.",
                    options: [
                        {
                            type: ApplicationCommandOptionType.String,
                            name: ADMIN_ACTION_OPTION_NAME,
                            description: "Config action.",
                            required: false,
                            choices: [
                                { name: ADMIN_ACTION_ADD, value: ADMIN_ACTION_ADD },
                                { name: ADMIN_ACTION_REMOVE, value: ADMIN_ACTION_REMOVE },
                            ],
                        },
                        {
                            type: ApplicationCommandOptionType.Role,
                            name: ADMIN_ROLE_OPTION_NAME,
                            description: "Guild role.",
                            required: false,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
                    description: "Configure the LFG role ping cooldown.",
                    options: [
                        setOrClearActionOption,
                        {
                            type: ApplicationCommandOptionType.Integer,
                            name: ADMIN_MINUTES_OPTION_NAME,
                            description: "Cooldown in minutes.",
                            required: false,
                            min_value: LFG_ROLE_PING_MINIMUM_COOLDOWN_MINUTES,
                        },
                    ],
                },
                {
                    type: ApplicationCommandOptionType.Subcommand,
                    name: ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
                    description: "Show LFG config.",
                },
            ],
        },
    ],
} as const satisfies ICommandCommandRegistrationData;
