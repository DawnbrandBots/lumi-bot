import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { getCommandAutocompleteHandler, getCommandRunHandler } from "./bot/command.ts";
import { DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import type { TCommandRegistry } from "./bot/types.ts";
import { getHelpCommand } from "./help/command.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import { getLinksCommand } from "./links/command.ts";
import getBot from "./loaders/bot.ts";
import type { TAllCommandData } from "./loaders/commandInfo.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import searchFeature from "./search/feature.ts";
import mapSearchFeatureReturnToMessages from "./search/mapper.ts";
import type { TSearchableEntity } from "./search/types.ts";
import isKeyOfExactObject from "./utils/isKeyOfExactObject.ts";

const log = debug("bot");

const orm = await getOrm(mikroOrmConfig);
const em = orm.em.fork();
const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const commands = {
    search: getSearchCommand<TSearchableEntity>({ searchEngine, em, handlers: SEARCH_HANDLERS }),
    help: getHelpCommand(),
    links: getLinksCommand(),
} satisfies TCommandRegistry<TAllCommandData>;

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
    const result = await searchFeature<TSearchableEntity>({ em, searchEngine, handlers: SEARCH_HANDLERS, input });
    const { reply, followUps } = mapSearchFeatureReturnToMessages<TSearchableEntity>(result, SEARCH_HANDLERS);
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
            return;
        }
        const command = commands[interaction.commandName];
        const autocomplete = getCommandAutocompleteHandler(command, interaction);
        const choices = await autocomplete?.(interaction);
        if (!choices) {
            // TODO: this should be reported in another PR
            return;
        }
        await interaction.respond(choices);
        return;
    }
});

// Implicitly use DISCORD_TOKEN
await bot.login();
