import type { SlashCommandBuilder } from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_COMMAND_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_MAX_ROOM_CODE_LENGTH,
    LFG_MIN_ROOM_CODE_LENGTH,
    LFG_PLAYER_OPTION_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";

export const lfgCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_CREATE_SUBCOMMAND_NAME)
                    .setDescription("Create a room.")
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
                    .setDescription("Join a room.")
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
                    .setDescription("Transfer room ownership.")
                    .addUserOption((option) =>
                        option.setName(LFG_PLAYER_OPTION_NAME).setDescription("New room owner.").setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(LFG_KICK_SUBCOMMAND_NAME)
                    .setDescription("Kick a player from your room.")
                    .addUserOption((option) =>
                        option.setName(LFG_PLAYER_OPTION_NAME).setDescription("Player to kick.").setRequired(true),
                    ),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_LEAVE_SUBCOMMAND_NAME).setDescription("Leave your current room."),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_LIST_SUBCOMMAND_NAME).setDescription("Display active rooms."),
            )
            .addSubcommand((subcommand) =>
                subcommand.setName(LFG_HELP_SUBCOMMAND_NAME).setDescription("Display LFG commands."),
            );
    },
    name: LFG_COMMAND_NAME,
    description: "Create and manage looking-for-game rooms.",
});
