import debug from "debug";
import { ActivityType, Client, Colors, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";

import { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";
import { createFuse } from "./search/search.js";


import { MikroORM } from "@mikro-orm/sqlite";


import mikroOrmConfig from './mikro-orm.config.ts';
import { Disciple, Weapon } from "./models.js";

const orm = await MikroORM.init(mikroOrmConfig)
const em = orm.em.fork()

const weapons = await em.findAll(Weapon, { populate: ["*"] })
const disciples = await em.findAll(Disciple, { populate: ["*"] })


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
