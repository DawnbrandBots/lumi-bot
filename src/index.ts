import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { getCommandAutocompleteHandler, getCommandRunHandler } from "./bot/commands/handlers.ts";
import type { TCommandRegistry } from "./bot/commands/types.ts";
import { DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import { getHelpCommand } from "./help/command/handlers.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import { getLinksCommand } from "./links/command/handlers.ts";
import getBot from "./loaders/bot.ts";
import type { TAllCommandApiInfo } from "./loaders/commandRuntimeInfo.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_CONFIGS from "./loaders/searchConfigs.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command/handlers.ts";
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
} satisfies TCommandRegistry<TAllCommandApiInfo>;

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
    for (const followUp of followUps ?? []) {
        await interaction.reply(followUp);
    }
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (interaction.isChatInputCommand()) {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = commands[interaction.commandName];
        const run = getCommandRunHandler(command, interaction);
        if (!run) {
            // TODO: this should be reported in another PR
            return;
        }
        await run(interaction);
        return;
    } else if (interaction.isAutocomplete()) {
        if (!isKeyOfExactObject(commands, interaction.commandName)) {
            // TODO: this should be reported in another PR
            return;
        }
        const command = commands[interaction.commandName];
        const autocomplete = getCommandAutocompleteHandler(command, interaction);
        const choices = await autocomplete?.(interaction);
        if (!choices) {
            // TODO: this should be reported in another PR
            await interaction.respond([]);
            return;
        }
        await interaction.respond(choices);
        return;
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
