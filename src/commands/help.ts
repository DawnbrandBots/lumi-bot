import { helpCommandInfo } from "../commandInfo/help.js";
import helpFeature from "../features/help.ts";
import type { ICommand } from "./base.ts";
import { Command } from "./base.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    run: function (interaction) {
        const response = helpFeature();
        return interaction.reply(response);
    },
});
