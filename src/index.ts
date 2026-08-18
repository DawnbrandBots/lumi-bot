import debug from "debug";
import { composeAdminUseCases } from "./composition/application/admin/useCases.ts";
import { composeLfgUseCases } from "./composition/application/lfg/useCases.ts";
import { composeSearchUseCases } from "./composition/application/search/useCases.ts";
import { composeDiscordBot } from "./composition/presentation/discord/bot.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
const em = orm.em.fork();

const adminUseCases = composeAdminUseCases({ em });
const lfgUseCases = composeLfgUseCases(em);
const searchUseCases = await composeSearchUseCases({ em });
const commands = composeDiscordCommands({ adminUseCases, lfgUseCases, searchUseCases });
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases });
const bot = composeDiscordBot({ eventHandlers });

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
