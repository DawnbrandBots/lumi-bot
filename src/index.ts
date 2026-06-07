import { Events } from "discord.js";
import { createBotFeatureRequestHandler } from "./bot/featureRequest.ts";
import type { ICommand } from "./bot/types.ts";
import { helpCommand } from "./help/command.ts";
import getBot from "./loaders/bot.ts";
import getClientReadyEventHandler from "./loaders/eventHandlers/clientReady.ts";
import getInteractionCreateEventHandler from "./loaders/eventHandlers/interactionCreate.ts";
import getMessageCreateEventHandler from "./loaders/eventHandlers/messageCreate.ts";
import getOrm from "./loaders/orm.ts";
import SEARCH_HANDLERS from "./loaders/searchHandlers.ts";
import getSearchItems from "./loaders/searchItems.ts";
import mikroOrmConfig from "./mikro-orm.config.ts";
import { getSearchCommand } from "./search/command.ts";
import { FuseSearchEngine } from "./search/engine.ts";
import createSearchFeature from "./search/feature.ts";
import type { TSearchableEntity } from "./search/types.ts";

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

bot.on(Events.ClientReady, getClientReadyEventHandler());
bot.on(Events.MessageCreate, getMessageCreateEventHandler({ handleBotFeatureRequest }));
bot.on(
    Events.InteractionCreate,
    getInteractionCreateEventHandler({
        commands,
        fallbackCommand: helpCommand,
        handleBotFeatureRequest,
    }),
);

// Implicitly use DISCORD_TOKEN
await bot.login();
