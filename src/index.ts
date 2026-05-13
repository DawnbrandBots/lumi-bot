import debug from "debug";
import { ActivityType, Events } from "discord.js";

import type { ICommand } from "./commands/base.js";
import { helpCommand } from "./commands/help.js";
import { getSearchCommand } from "./commands/search.js";

import helpFeature from "./features/help.ts";
import searchFeature from "./features/search.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import { FuseSearchEngine } from "./loaders/searchEngine.ts";
import type { TSearchableEntity } from "./loaders/searchItems.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import SEARCH_HANDLERS from "./searchHandlers/all.ts";

const log = debug("bot");

const orm = await getOrm(mikroOrmConfig);
const em = orm.em.fork();
const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const commands: Record<string, ICommand> = {
    search: getSearchCommand<TSearchableEntity>({ searchEngine, em, handlers: SEARCH_HANDLERS }),
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
        const response = helpFeature();
        await interaction.reply(response);
        return;
    }
    const startingBotMentionAndSpaceStr = startingBotMentionStr + " ";
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const response = await searchFeature<TSearchableEntity>({ em, searchEngine, handlers: SEARCH_HANDLERS, input });
    await interaction.reply(response);
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
