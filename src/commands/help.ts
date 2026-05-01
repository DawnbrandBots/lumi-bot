import { Colors, EmbedBuilder } from "discord.js";
import { helpCommandInfo } from "../commandInfo/help.js";
import { Command, ICommand } from "./base.ts";

export const helpCommand: ICommand = new Command({
    info: helpCommandInfo,
    run: function (interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGold)
                    .setTitle("Lumi")
                    .setDescription("Umbra serves the shadow")
                    .setFooter({ text: "Fire Emblem" }),
            ],
        });
    }
})