import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import { getHelpCommand } from "./help/command.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import { getLinksCommand } from "./links/command.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_CONFIGS from "./loaders/searchConfigs.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import searchFeature from "./search/feature.ts";
import mapSearchFeatureReturnToMessages from "./search/mapper.ts";
import isKeyOfExactObject from "./utils/isKeyOfExactObject.ts";

const log = debug("bot");

const orm = await getOrm(mikroOrmConfig);
const em = orm.em.fork();
const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const commands = {
    search: getSearchCommand({ searchEngine, em, configs: SEARCH_CONFIGS }),
    help: getHelpCommand(),
    links: getLinksCommand(),
} as const;

bot.on(Events.ClientReady, (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
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
    const result = await searchFeature({ em, searchEngine, configs: SEARCH_CONFIGS, input });
    const { reply, followUps } = mapSearchFeatureReturnToMessages(result);
    await interaction.reply(reply);
    if (followUps) {
        for (const followUp of followUps) {
            await interaction.reply(followUp);
        }
    }
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (interaction.isChatInputCommand()) {
        const command = isKeyOfExactObject(commands, interaction.commandName)
            ? commands[interaction.commandName]
            : commands.help;
        await command.run(interaction);
        return;
    } else if (interaction.isAutocomplete()) {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            return;
        }
        const command = commands[interaction.commandName];
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
