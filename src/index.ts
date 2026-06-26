import debug from "debug";
import {
    ActivityType,
    ChannelType,
    Events,
    PermissionFlagsBits,
    userMention,
    type BaseMessageOptions,
} from "discord.js";
import { AdminCommand } from "./admin/command.ts";
import { AdminFeature } from "./admin/feature.ts";
import { DISCORD_BOT_ACTIVITY } from "./bot/constants.ts";
import type { ICommand } from "./bot/types.ts";
import { getHelpCommand } from "./help/command.ts";
import helpFeature from "./help/feature.ts";
import mapHelpFeatureReturnToMessage from "./help/mapper.ts";
import { getLfgCommand } from "./lfg/command.ts";
import { LfgFeature } from "./lfg/feature.ts";
import { LfgInactivityService } from "./lfg/inactivityService.ts";
import { getLfgManageCommand } from "./lfgManage/command.ts";
import { getLinksCommand } from "./links/command.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import { configsById } from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import searchFeature from "./search/feature.ts";
import mapSearchFeatureReturnToMessage from "./search/mapper.ts";
import type { TSearchableEntity } from "./search/types.ts";
import isKeyOfExactObject from "./utils/isKeyOfExactObject.ts";

const log = debug("bot");

const gameOrm = await getOrm(configsById.game);
const gameEm = gameOrm.em.fork();

const lumiOrm = await getOrm(configsById.lumi);
const lumiEm = lumiOrm.em.fork();

const searchItems = await getSearchItems(gameEm);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const bot = getBot();

// TODO: I wonder whether some changes like canSendDiscordMessage and sendDiscordMessage really belong here
// Read back the commit's diff later and determine what must be moved

const adminFeature = new AdminFeature({ em: lumiEm });
const lfgFeature = new LfgFeature({ em: lumiEm });
const lfgInactivityService = new LfgInactivityService({
    orm: lumiOrm,
    canSendMessage: canSendDiscordMessage,
    sendMessage: sendDiscordMessage,
});
const commands = {
    admin: new AdminCommand({
        adminFeature,
        onLfgChannelChange: async (_interaction, guildId, previousChannelId, nextChannelId) => {
            await lfgInactivityService.handleLfgChannelChange(guildId, previousChannelId, nextChannelId);
        },
    }),
    search: getSearchCommand<TSearchableEntity>({ searchEngine, em: gameEm, handlers: SEARCH_HANDLERS }),
    help: getHelpCommand(),
    links: getLinksCommand(),
    lfg: getLfgCommand({
        adminFeature,
        lfgFeature,
        onActivityCommand: (guildId, userId) => lfgInactivityService.recordCommandActivity(guildId, userId),
    }),
    "lfg-manage": getLfgManageCommand({ adminFeature, lfgFeature }),
} as const;

async function canSendDiscordMessage(channelId: string): Promise<boolean> {
    try {
        const channel = await bot.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText || !bot.user) {
            return false;
        }
        return (
            channel
                .permissionsFor(bot.user)
                ?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]) ?? false
        );
    } catch (error) {
        log(`Failed to fetch Discord channel ${channelId}`, error);
        return false;
    }
}

// TODO: again, such function should not be provided to an element from the application layer
async function sendDiscordMessage(channelId: string, message: string | BaseMessageOptions): Promise<boolean> {
    try {
        const channel = await bot.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            log(`Discord channel ${channelId} is unavailable or not a guild text channel.`);
            return false;
        }
        await channel.send(message);
        return true;
    } catch (error) {
        log(`Failed to send message to Discord channel ${channelId}`, error);
        return false;
    }
}

await lfgInactivityService.start();

bot.on(Events.ClientReady, (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity(DISCORD_BOT_ACTIVITY, { type: ActivityType.Custom });
});

bot.on(Events.MessageCreate, async (interaction) => {
    log(interaction);

    if (interaction.author.bot) {
        return;
    }
    if (interaction.guildId) {
        await lfgInactivityService.recordMessageActivity(
            interaction.guildId,
            interaction.channelId,
            interaction.author.id,
        );
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
    const result = await searchFeature<TSearchableEntity>({
        em: gameEm,
        searchEngine,
        handlers: SEARCH_HANDLERS,
        input,
    });
    const message = mapSearchFeatureReturnToMessage<TSearchableEntity>(result, SEARCH_HANDLERS);
    await interaction.reply(message);
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
        const command: ICommand = commands[interaction.commandName];
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
