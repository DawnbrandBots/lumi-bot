import { Command } from "../bot/command.ts";
import { createErrorMessage } from "../bot/message.ts";
import { helpCommandInfo } from "./commandInfo.ts";
import { HELP_BOT_SUBCOMMAND_NAME, HELP_SHADOWS_SUBCOMMAND_NAME } from "./constants.ts";
import type HelpFeature from "./feature.ts";
import mapHelpFeatureReturnToMessage from "./mapper.ts";

export default function getHelpCommand(arg: { helpFeature: HelpFeature }) {
    return new Command({
        info: helpCommandInfo,
        run: function (interaction) {
            const subcommand = interaction.options.getSubcommand(true) ?? HELP_BOT_SUBCOMMAND_NAME;
            if (subcommand === HELP_BOT_SUBCOMMAND_NAME) {
                return interaction.reply(mapHelpFeatureReturnToMessage(arg.helpFeature.bot));
            }
            if (subcommand === HELP_SHADOWS_SUBCOMMAND_NAME) {
                return interaction.reply(mapHelpFeatureReturnToMessage(arg.helpFeature.shadows));
            }
            return interaction.reply(
                createErrorMessage({ embed: { description: `Unknown subcommand: ${subcommand}` } }),
            );
        },
    });
}
