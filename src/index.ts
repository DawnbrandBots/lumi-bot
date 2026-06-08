import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { DISCORD_BOT_ABOUT_ME, DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import type { ICommand } from "./bot/types.ts";
import { helpCommand } from "./help/command.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import searchFeature from "./search/feature.ts";
import mapSearchFeatureReturnToMessage from "./search/mapper.ts";
import type { TSearchableEntity } from "./search/types.ts";

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

bot.on(Events.ClientReady, async (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
    await client.application.edit({ description: DISCORD_BOT_ABOUT_ME });
});

bot.on(Events.MessageCreate, async (interaction) => {
    log(interaction);

    if (interaction.author.bot) {
        return;
    }
    const mentionedUsers = interaction.mentions.parsedUsers;
    if (!mentionedUsers.has(interaction.client.user.id)) {
        return;
    }
    const botMention = userMention(interaction.client.user.id);
    if (interaction.content === botMention) {
        const message = mapHelpFeatureReturnToMessage(helpFeature());
        await interaction.reply(message);
        return;
    }
    const startingBotMentionAndSpaceStr = botMention + " ";
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const result = await searchFeature<TSearchableEntity>({ em, searchEngine, handlers: SEARCH_HANDLERS, input });
    const message = mapSearchFeatureReturnToMessage<TSearchableEntity>(result, SEARCH_HANDLERS);
    await interaction.reply(message);
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (interaction.isChatInputCommand()) {
        const command = commands[interaction.commandName] || helpCommand;
        await command.run(interaction);
        return;
    } else if (interaction.isAutocomplete()) {
        const command = commands[interaction.commandName];
        if (!command) {
            return;
        }
        const choices = await command.autocomplete?.(interaction);
        if (!choices) {
            return;
        }
        await interaction.respond(choices);
        return;
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
