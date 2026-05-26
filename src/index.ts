import debug from "debug";
import { ActivityType, Events, userMention } from "discord.js";
import { AdminCommand } from "./admin/command.ts";
import { AdminFeature } from "./admin/feature.ts";
import type { ICommand } from "./bot/types.ts";
import { helpCommand } from "./help/command.ts";
import helpFeature from "./help/feature.ts";
import { LfgCommand } from "./lfg/command.ts";
import { LfgFeature } from "./lfg/feature.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import { configsById } from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import searchFeature from "./search/feature.ts";
import type { TSearchableEntity } from "./search/types.ts";

const log = debug("bot");

const gameOrm = await getOrm(configsById.game);
const gameEm = gameOrm.em.fork();

const lfgOrm = await getOrm(configsById.lfg);
const lfgEm = lfgOrm.em.fork();

const searchItems = await getSearchItems(gameEm);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

const adminFeature = new AdminFeature({ em: lfgEm });
const lfgFeature = new LfgFeature({ em: lfgEm });
const commands: Record<string, ICommand> = {
    admin: new AdminCommand({ adminFeature }),
    search: getSearchCommand<TSearchableEntity>({ searchEngine, em: gameEm, handlers: SEARCH_HANDLERS }),
    help: helpCommand,
    lfg: new LfgCommand({ lfgFeature, adminFeature }),
};

bot.on(Events.ClientReady, (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
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
        const response = helpFeature();
        await interaction.reply(response);
        return;
    }
    const startingBotMentionAndSpaceStr = botMention + " ";
    if (!interaction.content.startsWith(startingBotMentionAndSpaceStr)) {
        return;
    }
    const input = interaction.content.slice(startingBotMentionAndSpaceStr.length);
    const response = await searchFeature<TSearchableEntity>({
        em: gameEm,
        searchEngine,
        handlers: SEARCH_HANDLERS,
        input,
    });
    await interaction.reply(response);
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
