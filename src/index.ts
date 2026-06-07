import debug from "debug";
import { ActivityType, Events } from "discord.js";
import { createBotFeatureRequestHandler } from "./bot/featureRequest.ts";
import { mapMentionMessageToFeatureRequest } from "./bot/messageRequest.ts";
import { addDefaultFollowUps, sendInteractionResponse, sendMessageResponse } from "./bot/response.ts";
import type { ICommand } from "./bot/types.ts";
import { helpCommand } from "./help/command.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import createSearchFeature from "./search/feature.ts";
import type { TSearchableEntity } from "./search/types.ts";

const log = debug("bot");

const orm = await getOrm(mikroOrmConfig);
const em = orm.em.fork();
const searchItems = await getSearchItems(em);
const searchEngine = new FuseSearchEngine({ items: searchItems });
const searchFeature = createSearchFeature<TSearchableEntity>({ searchEngine, em, handlers: SEARCH_HANDLERS });
const bot = getBot();

const commands: Record<string, ICommand> = {
    search: getSearchCommand<TSearchableEntity>({ searchEngine }),
    help: helpCommand,
};
const handleBotFeatureRequest = createBotFeatureRequestHandler<TSearchableEntity>({
    searchFeature,
    handlers: SEARCH_HANDLERS,
});

bot.on(Events.ClientReady, (client) => {
    log(`Logged in as ${bot.user?.tag} - ${bot.user?.id}`);
    client.user.setActivity("Umbra serves the shadow", { type: ActivityType.Custom });
});

bot.on(Events.MessageCreate, async (message) => {
    log(message);

    const request = mapMentionMessageToFeatureRequest(message);
    if (!request) {
        return;
    }
    const baseResponse = await handleBotFeatureRequest(request);
    await sendMessageResponse(message, addDefaultFollowUps(baseResponse));
});

bot.on(Events.InteractionCreate, async (interaction) => {
    log(interaction);

    if (interaction.isChatInputCommand()) {
        const command = commands[interaction.commandName] || helpCommand;
        const request = await command.request(interaction);
        const baseResponse = await handleBotFeatureRequest(request);
        await sendInteractionResponse(interaction, addDefaultFollowUps(baseResponse));
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
