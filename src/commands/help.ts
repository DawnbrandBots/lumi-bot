import { helpCommandInfo } from "../commandInfo/help.js";
import helpFeature from "../features/help.ts";
import { Command, ICommand } from "./base.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    run: function (interaction) {
        const help = helpFeature();
        return interaction.reply({
            embeds: [help],
        });
    },
});
