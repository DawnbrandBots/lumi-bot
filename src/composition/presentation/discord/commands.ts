import type { TApplicationUseCases } from "../../../application/useCases.types.ts";
import type { TAllCommandRegistrationData } from "../../../presentation/discord/commandRegistrationData.ts";
import type { TCommandRegistry } from "../../../presentation/discord/commands/types.ts";
import { composeAdminCommand } from "./commands/admin.ts";
import { composeHelpCommand } from "./commands/help.ts";
import { composeLfgCommand } from "./commands/lfg.ts";
import { composeLfgManageCommand } from "./commands/lfgManage.ts";
import { composeLinksCommand } from "./commands/links.ts";
import { composeSearchCommand } from "./commands/search.ts";

export function composeDiscordCommands(arg: {
    readonly useCases: TApplicationUseCases;
}): TCommandRegistry<TAllCommandRegistrationData> {
    return {
        admin: composeAdminCommand(arg.useCases),
        search: composeSearchCommand(arg.useCases),
        help: composeHelpCommand(),
        links: composeLinksCommand(),
        lfg: composeLfgCommand({ useCases: arg.useCases }),
        "lfg-manage": composeLfgManageCommand({ useCases: arg.useCases }),
    };
}
