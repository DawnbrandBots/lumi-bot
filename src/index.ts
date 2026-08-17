import debug from "debug";
import { Events } from "discord.js";
import { composeAdminFeature } from "./composition/application/admin/feature.ts";
import { composeLfgUseCases } from "./composition/application/lfg/useCases.ts";
import { composeSearchUseCases } from "./composition/application/search/useCases.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import getBot from "./loaders/bot.ts";
import getOrm from "./loaders/orm.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";

const log = debug("index.ts");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const bot = getBot();

const adminFeature = composeAdminFeature({ em });
const lfgUseCases = composeLfgUseCases(em);
const searchUseCases = await composeSearchUseCases({ em });
const commands = composeDiscordCommands({ adminFeature, lfgUseCases, searchUseCases });
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases });

bot.on(Events.ClientReady, eventHandlers.clientReady);
bot.on(Events.MessageCreate, eventHandlers.messageCreate);
bot.on(Events.InteractionCreate, eventHandlers.interactionCreate);

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
