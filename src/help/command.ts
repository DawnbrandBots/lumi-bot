import { Command } from "../bot/command.ts";
import { helpCommandInfo } from "./commandInfo.ts";
import helpFeature from "./feature.ts";
import mapHelpFeatureReturnToMessage from "./mapper.ts";

export function getHelpCommand() {
    return new Command({
        info: helpCommandInfo,
        run: async function (interaction) {
            await interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
        },
    });
}
