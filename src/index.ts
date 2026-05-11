import debug from "debug";
import { ActivityType, Events } from "discord.js";

import { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";

import helpFeature from "./features/help.ts";
import searchFeature from "./features/search.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import getSearchables from "./loaders/searchables.ts";
import { FuseSearchEngine } from "./loaders/searchEngine.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import SEARCH_HANDLERS from "./searchHandlers/all.ts";

const log = debug("bot");

const orm = await getOrm(mikroOrmConfig);
const em = orm.em.fork();
const searchables = await getSearchables(em);
const searchEngine = new FuseSearchEngine({ items: searchables });
const bot = getBot();

const commands: Record<string, ICommand> = {
    search: getSearchCommand({ searchEngine, em, handlers: SEARCH_HANDLERS }),
    help: helpCommand,
};

bot.on(Events.ClientReady, () => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    bot.user?.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

bot.on(Events.MessageCreate, async (interaction) => {
    log(interaction);

    if (interaction.author.bot) {
        return;
    }
    const mentionedUsers = interaction.mentions.parsedUsers;
    if (!bot.user) {
        throw new Error("Bot should have a user property when monitoring messages");
    }
    if (!mentionedUsers.has(bot.user.id)) {
        return;
    }
    const startingBotMentionStr = `<@${bot.user.id}>`;
    if (interaction.content === startingBotMentionStr) {
        const help = helpFeature();
        await interaction.reply({ embeds: [help] });
        return;
    }
    const startingBotMentionAndSpaceStr = startingBotMentionStr + " ";
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const embed = await searchFeature({ em, searchEngine, handlers: SEARCH_HANDLERS, input });
    await interaction.reply({
        embeds: [embed],
    });
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commands[interaction.commandName] || helpCommand;
    await command.run(interaction);
});

// Implicitly use DISCORD_TOKEN
await bot.login();
