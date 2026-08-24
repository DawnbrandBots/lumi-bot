import debug from "debug";
import type { TAdminPersistence } from "./application/admin/persistence.types.ts";
import ADMIN_USE_CASES from "./application/admin/useCases.ts";
import type { TAdminUseCases } from "./application/admin/useCases.types.ts";
import { getLfgApplicationDependencies } from "./application/lfg/dependencies.ts";
import type { TLfgPersistence } from "./application/lfg/persistence.types.ts";
import LFG_USE_CASES from "./application/lfg/useCases.ts";
import type { TLfgUseCases } from "./application/lfg/useCases.types.ts";
import { composeSearchUseCases } from "./composition/application/search/useCases.ts";
import { getWithUnitOfWork } from "./composition/application/unitOfWork.ts";
import { getPersistenceWithContext, getUseCasesWithUnitOfWork } from "./composition/application/useCases.ts";
import { composeDiscordBot } from "./composition/presentation/discord/bot.ts";
import { composeDiscordCommands } from "./composition/presentation/discord/commands.ts";
import { composeDiscordEventHandlers } from "./composition/presentation/discord/eventHandlers.ts";
import { appMikroOrmConfig } from "./infrastructure/database/mikroOrm/config.ts";
import { initOrm } from "./infrastructure/database/mikroOrm/orm.ts";
import ADMIN_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/admin.ts";
import LFG_REPOSITORIES from "./infrastructure/database/mikroOrm/repositories/lfg.ts";

const log = debug("index.ts");

const orm = await initOrm(appMikroOrmConfig);
const em = orm.em.fork();

const withAdminUnitOfWork = getWithUnitOfWork({
    em,
    getDependencies: (em) =>
        getPersistenceWithContext<TAdminPersistence>({
            em,
            repositories: ADMIN_REPOSITORIES,
        }),
});
const adminUseCases = getUseCasesWithUnitOfWork<TAdminUseCases>({
    useCases: ADMIN_USE_CASES,
    withUnitOfWork: withAdminUnitOfWork,
});

const withLfgUnitOfWork = getWithUnitOfWork({
    em,
    getDependencies: (em) =>
        getLfgApplicationDependencies(
            getPersistenceWithContext<TLfgPersistence>({
                em,
                repositories: LFG_REPOSITORIES,
            }),
        ),
});
const lfgUseCases = getUseCasesWithUnitOfWork<TLfgUseCases>({
    useCases: LFG_USE_CASES,
    withUnitOfWork: withLfgUnitOfWork,
});

const searchUseCases = await composeSearchUseCases({ em });
const commands = composeDiscordCommands({ adminUseCases, lfgUseCases, searchUseCases });
const eventHandlers = composeDiscordEventHandlers({ commands, searchUseCases });
const bot = composeDiscordBot({ eventHandlers });

// Implicitly use DISCORD_TOKEN
await bot.login();

log("index.ts done!");
