import { Command } from "../bot/command.ts";
import type { ICommand } from "../bot/types.ts";
import { helpCommandInfo } from "./commandInfo.ts";
import helpFeature from "./feature.ts";
import mapHelpFeatureReturnToResponse from "./mapper.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    run: function (interaction) {
        const response = mapHelpFeatureReturnToResponse(helpFeature());
        return interaction.reply(response);
    },
});
