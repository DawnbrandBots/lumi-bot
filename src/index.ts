import debug from "debug";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { composeApplication } from "./composition/application.ts";
import { composeInfrastructure } from "./composition/infrastructure.ts";
import { createSearchEngine } from "./composition/infrastructure/search.ts";
import { composePresentation } from "./composition/presentation.ts";
import { appMikroOrmConfig } from "./infrastructure/persistence/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/persistence/mikroOrm/orm.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
// TODO: if not using RequestContext, useContext still necessary?
const em = orm.em.fork({ useContext: true });
const searchEngine = await createSearchEngine({ em });
const { queries, repositories, withinTransaction } = composeInfrastructure({ em, searchEngine });
const { useCases: builtUseCases } = composeApplication({
    queries,
    repositories,
    useCaseMiddleware: withinTransaction,
});
const eventHandlers = composePresentation({ useCases: builtUseCases });

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages];
const bot = new Client({ intents });
bot.on(Events.ClientReady, eventHandlers[Events.ClientReady]);
bot.on(Events.MessageCreate, eventHandlers[Events.MessageCreate]);
bot.on(Events.InteractionCreate, eventHandlers[Events.InteractionCreate]);
// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
