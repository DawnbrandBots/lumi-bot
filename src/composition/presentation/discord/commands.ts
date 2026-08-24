import type { TAllCommandRegistrationData } from "../../../presentation/discord/commandRegistrationData.ts";
import type { TCommandRegistry } from "../../../presentation/discord/commands/types.ts";
import type { TAdminUseCases } from "../../../application/admin/useCases.types.ts";
import type { TLfgUseCases } from "../../../application/lfg/useCases.types.ts";
import type { TSearchUseCases } from "../../../application/search/useCases.types.ts";
import { composeAdminCommand } from "./commands/admin.ts";
import { composeHelpCommand } from "./commands/help.ts";
import { composeLfgCommand } from "./commands/lfg.ts";
import { composeLfgManageCommand } from "./commands/lfgManage.ts";
import { composeLinksCommand } from "./commands/links.ts";
import { composeSearchCommand } from "./commands/search.ts";

export function composeDiscordCommands(arg: {
    readonly adminUseCases: TAdminUseCases;
    readonly lfgUseCases: TLfgUseCases;
    readonly searchUseCases: TSearchUseCases;
}): TCommandRegistry<TAllCommandRegistrationData> {
    return {
        admin: composeAdminCommand(arg.adminUseCases),
        search: composeSearchCommand(arg.searchUseCases),
        help: composeHelpCommand(),
        links: composeLinksCommand(),
        lfg: composeLfgCommand({ adminUseCases: arg.adminUseCases, lfgUseCases: arg.lfgUseCases }),
        "lfg-manage": composeLfgManageCommand({ adminUseCases: arg.adminUseCases, lfgUseCases: arg.lfgUseCases }),
    };
}
