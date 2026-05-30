import { ChannelType, InteractionContextType, PermissionFlagsBits, type SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_COMMAND_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "./constants.ts";

export const adminCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return (
            baseInfo
                // TODO: ManageGuild or admin?
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
                .addSubcommandGroup((group) =>
                    group
                        .setName(ADMIN_LFG_GROUP_NAME)
                        .setDescription("Configure LFG.")
                        .addSubcommand((subcommand) =>
                            subcommand
                                .setName(ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME)
                                .setDescription("Configure the LFG public channel.")
                                .addStringOption((option) =>
                                    option
                                        .setName(ADMIN_ACTION_OPTION_NAME)
                                        .setDescription("Config action.")
                                        .setRequired(false)
                                        .addChoices(
                                            { name: ADMIN_ACTION_SET, value: ADMIN_ACTION_SET },
                                            { name: ADMIN_ACTION_CLEAR, value: ADMIN_ACTION_CLEAR },
                                        ),
                                )
                                .addChannelOption((option) =>
                                    option
                                        .setName(ADMIN_CHANNEL_OPTION_NAME)
                                        .setDescription("Guild text channel.")
                                        .setRequired(false)
                                        .addChannelTypes(ChannelType.GuildText),
                                ),
                        )
                        .addSubcommand((subcommand) =>
                            subcommand.setName(ADMIN_LFG_SHOW_SUBCOMMAND_NAME).setDescription("Show LFG config."),
                        ),
                )
        );
    },
    name: ADMIN_COMMAND_NAME,
    description: "Configure Lumi for this server.",
    contexts: [InteractionContextType.Guild],
});
