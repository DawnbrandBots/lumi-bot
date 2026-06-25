import {
    ApplicationIntegrationType,
    InteractionContextType,
    PermissionFlagsBits,
    type SlashCommandBuilder,
    type SlashCommandSubcommandBuilder,
} from "discord.js";
import { CommandInfo } from "../bot/commandInfo.ts";
import type { ICommandInfo } from "../bot/types.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_MAX_ROOM_CODE_LENGTH,
    LFG_MIN_ROOM_CODE_LENGTH,
    LFG_PLAYER_OPTION_NAME,
} from "../lfg/constants.ts";

function addRoomCodeOption(subcommand: SlashCommandSubcommandBuilder) {
    return subcommand.addStringOption((option) =>
        option
            .setName(LFG_CODE_OPTION_NAME)
            .setDescription("Room code.")
            .setMinLength(LFG_MIN_ROOM_CODE_LENGTH)
            .setMaxLength(LFG_MAX_ROOM_CODE_LENGTH)
            .setRequired(true),
    );
}

export const lfgManageCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo: SlashCommandBuilder) {
        return baseInfo
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
            .addSubcommand((subcommand) =>
                addRoomCodeOption(
                    subcommand
                        .setName("create")
                        .setDescription("Create a room for a player.")
                        .addUserOption((option) =>
                            option.setName(LFG_PLAYER_OPTION_NAME).setDescription("Room owner.").setRequired(true),
                        ),
                ),
            )
            .addSubcommand((subcommand) =>
                addRoomCodeOption(
                    subcommand
                        .setName("move")
                        .setDescription("Move a player to a room.")
                        .addUserOption((option) =>
                            option.setName(LFG_PLAYER_OPTION_NAME).setDescription("Player to move.").setRequired(true),
                        ),
                ),
            )
            .addSubcommand((subcommand) =>
                addRoomCodeOption(
                    subcommand
                        .setName("kick")
                        .setDescription("Kick a player from their room.")
                        .addUserOption((option) =>
                            option.setName(LFG_PLAYER_OPTION_NAME).setDescription("Player to kick.").setRequired(true),
                        ),
                ),
            )
            .addSubcommand((subcommand) =>
                addRoomCodeOption(subcommand.setName("disband").setDescription("Disband a room.")),
            );
    },
    name: "lfg-manage",
    description: "Manage looking-for-game rooms.",
    contexts: [InteractionContextType.Guild],
    integrationTypes: [ApplicationIntegrationType.GuildInstall],
});
