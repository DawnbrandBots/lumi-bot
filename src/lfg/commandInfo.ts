import { ApplicationIntegrationType, InteractionContextType, type SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import {
    LFG_CODE_OPTION_NAME,
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
    LFG_PLAYER_OPTION_NAME,
    LFG_SHOW_RESPONSE_OPTION_NAME,
    LFG_STATUS_SUBCOMMAND_DESCRIPTION,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_DESCRIPTION,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";

export const lfgCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_CREATE_SUBCOMMAND_NAME)
                    .setDescription(LFG_CREATE_SUBCOMMAND_DESCRIPTION)
                    .addStringOption((option) =>
                        option
                            .setName(LFG_CODE_OPTION_NAME)
                            .setDescription("Room code.")
                            .setMinLength(LFG_MIN_ROOM_CODE_LENGTH)
                            .setMaxLength(LFG_MAX_ROOM_CODE_LENGTH)
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_JOIN_SUBCOMMAND_NAME)
                    .setDescription(LFG_JOIN_SUBCOMMAND_DESCRIPTION)
                    .addStringOption((option) =>
                        option
                            .setName(LFG_CODE_OPTION_NAME)
                            .setDescription("Room code.")
                            .setMinLength(LFG_MIN_ROOM_CODE_LENGTH)
                            .setMaxLength(LFG_MAX_ROOM_CODE_LENGTH)
                            .setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_TRANSFER_SUBCOMMAND_NAME)
                    .setDescription(LFG_TRANSFER_SUBCOMMAND_DESCRIPTION)
                    .addUserOption((option) =>
                        option.setName(LFG_PLAYER_OPTION_NAME).setDescription("New room owner.").setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_KICK_SUBCOMMAND_NAME)
                    .setDescription(LFG_KICK_SUBCOMMAND_DESCRIPTION)
                    .addUserOption((option) =>
                        option.setName(LFG_PLAYER_OPTION_NAME).setDescription("Player to kick.").setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_LEAVE_SUBCOMMAND_NAME).setDescription(LFG_LEAVE_SUBCOMMAND_DESCRIPTION),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_DISBAND_SUBCOMMAND_NAME).setDescription(LFG_DISBAND_SUBCOMMAND_DESCRIPTION),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_STATUS_SUBCOMMAND_NAME)
                    .setDescription(LFG_STATUS_SUBCOMMAND_DESCRIPTION)
                    .addBooleanOption((option) =>
                        option
                            .setName(LFG_SHOW_RESPONSE_OPTION_NAME)
                            .setDescription("Show response to everyone. false by default."),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_HELP_SUBCOMMAND_NAME).setDescription(LFG_HELP_SUBCOMMAND_DESCRIPTION),
            );
    },
    name: LFG_COMMAND_NAME,
    description: "Create and join looking-for-game rooms for playing with other server members.",
    contexts: [InteractionContextType.Guild],
    integrationTypes: [ApplicationIntegrationType.GuildInstall],
});
