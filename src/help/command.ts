import { Command } from "../bot/command.ts";
import { helpCommandInfo } from "./commandInfo.ts";
import helpFeature from "./feature.ts";
import mapHelpFeatureReturnToMessage from "./mapper.ts";

export function getHelpCommand() {
    return new Command({
        info: helpCommandInfo,
        run: function (interaction) {
            return interaction.reply(mapHelpFeatureReturnToMessage(helpFeature()));
        },
    });
}
