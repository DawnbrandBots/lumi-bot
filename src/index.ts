import { Events } from "discord.js";
import type { TBotRequest, TBotRequestHandler } from "./bot/request.ts";
import { createHelpBotRequestHandler, createSearchBotRequestHandler, EBotRequestKind } from "./bot/request.ts";
import type { ICommand, IInteractionHandlerReturnType } from "./bot/types.ts";
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
const botRequestHandlers: { [K in EBotRequestKind]: TBotRequestHandler<TBotRequest & { kind: K }> } = {
    [EBotRequestKind.HELP]: createHelpBotRequestHandler(),
    [EBotRequestKind.SEARCH]: createSearchBotRequestHandler({
        searchFeature,
        handlers: SEARCH_HANDLERS,
    }),
};
async function handleBotRequest<K extends EBotRequestKind>(
    request: TBotRequest & { kind: K },
): Promise<IInteractionHandlerReturnType> {
    const handler = botRequestHandlers[request.kind];
    return handler(request);
}

bot.on(Events.ClientReady, getClientReadyEventHandler());
bot.on(Events.MessageCreate, getMessageCreateEventHandler({ handleBotRequest }));
bot.on(
    Events.InteractionCreate,
    getInteractionCreateEventHandler({
        commands,
        fallbackCommand: helpCommand,
        handleBotRequest,
    }),
);

// Implicitly use DISCORD_TOKEN
await bot.login();
