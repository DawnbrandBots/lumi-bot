import debug from "debug";
import { ActivityType, Client, Colors, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";

import { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";
import { createFuse } from "./search/search.js";

import colorDtos from "../data/colors.json" with { type: "json" };
import weaponTypeDtos from "../data/weaponTypes.json" with { type: "json" };
import weaponDtos from "../data/weapons.json" with { type: "json" };
import movementDtos from "../data/movements.json" with { type: "json" };
import discipleDtos from "../data/disciples.json" with { type: "json" };

import initData from "./data/init.js";
import { searchTermsOptionName, searchCommandName } from "./commands/search.js";
import { createFuse, search } from "./search/search.js";
import z from "zod";
import { color, disciple, movement, weapon, weaponType } from "./search/validate.js";

const validatedDtos = {
    colorDtos: z.array(color).parse(colorDtos),
    weaponTypeDtos: z.array(weaponType).parse(weaponTypeDtos),
    weaponDtos: z.array(weapon).parse(weaponDtos),
    movementDtos: z.array(movement).parse(movementDtos),
    discipleDtos: z.array(disciple).parse(discipleDtos),
}

const { weapons, disciples } = initData(validatedDtos);
const fuseItems = [...weapons, ...disciples]
const fuse = createFuse({ items: fuseItems })

const log = debug("bot");

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

const commands: Record<string, ICommand> = {
    search: getSearchCommand({ fuse }),
    help: helpCommand
}

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands[interaction.commandName]
    if (command) {
        await command.run(interaction)
    } else {
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGold)
                    .setTitle("Lumi")
                    .setDescription("Umbra serves the shadow")
                    .setFooter({ text: "Fire Emblem" }),
            ],
        });
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
