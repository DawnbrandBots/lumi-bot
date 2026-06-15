import { CommandInfo } from "../bot/commandInfo.ts";
import { DISCORD_BOT_NAME } from "../bot/constants.ts";
import type { ICommandInfo } from "../bot/types.ts";
import { HELP_BOT_SUBCOMMAND_NAME, HELP_SHADOWS_SUBCOMMAND_NAME } from "./constants.ts";

export const helpCommandInfo: ICommandInfo = new CommandInfo({
    customInfo: function (baseInfo) {
        return baseInfo
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(HELP_BOT_SUBCOMMAND_NAME)
                    .setDescription(`Displays help for ${DISCORD_BOT_NAME} bot.`),
            )
            .addSubcommand((subcommand) =>
                subcommand
                    .setName(HELP_SHADOWS_SUBCOMMAND_NAME)
                    .setDescription("Displays official Fire Emblem Shadows links."),
            );
    },
    name: "help",
    description: `Displays help for ${DISCORD_BOT_NAME} bot.`,
    pingEquivalent: `@${DISCORD_BOT_NAME}`,
});
