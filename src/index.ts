import debug from "debug";
import { composeAdminFeature } from "./composition/application/admin/feature.ts";
import { composeLfgUseCases } from "./composition/application/lfg/useCases.ts";
import { composeSearchUseCases } from "./composition/application/search/useCases.ts";
import { composeDiscordBot } from "./composition/presentation/discord/bot.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import getOrm from "./loaders/orm.ts";
import { appMikroOrmConfig } from "./mikro-orm.config.ts";

const log = debug("index.ts");

const orm = await getOrm(appMikroOrmConfig);
const em = orm.em.fork();

const adminFeature = composeAdminFeature({ em });
const lfgUseCases = composeLfgUseCases(em);
const searchUseCases = await composeSearchUseCases({ em });
const commands = composeDiscordCommands({ adminFeature, lfgUseCases, searchUseCases });
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases });
const bot = composeDiscordBot({ eventHandlers });

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
