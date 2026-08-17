import type { TAdminUseCases } from "../../application/admin/useCases.ts";
import type { TLfgUseCases } from "../../application/lfg/useCases.ts";
import type { TSearchUseCases } from "../../application/search/useCases.ts";
import type { TAllCommandRegistrationData } from "../../../presentation/discord/commandRegistrationData.ts";
import { getLfgAutocomplete } from "../../../presentation/discord/autocomplete/lfg.ts";
import { getLfgManageAutocomplete } from "../../../presentation/discord/autocomplete/lfgManage.ts";
import { getSearchAutocomplete } from "../../../presentation/discord/autocomplete/search.ts";
import { getAdminCommand } from "../../../presentation/discord/commands/admin.ts";
import { getHelpCommand } from "../../../presentation/discord/commands/help.ts";
import { getLfgCommand } from "../../../presentation/discord/commands/lfg.ts";
import { getLfgManageCommand } from "../../../presentation/discord/commands/lfgManage.ts";
import { getLinksCommand } from "../../../presentation/discord/commands/links.ts";
import { getSearchCommand } from "../../../presentation/discord/commands/search.ts";
import type { TCommandRegistry } from "../../../presentation/discord/commands/types.ts";

export function composeDiscordCommands(arg: {
    readonly adminUseCases: TAdminUseCases;
    readonly lfgUseCases: TLfgUseCases;
    readonly searchUseCases: TSearchUseCases;
}): TCommandRegistry<TAllCommandRegistrationData> {
    return {
        admin: { run: getAdminCommand(arg.adminUseCases) },
        search: {
            run: getSearchCommand({ resolveSearchInput: arg.searchUseCases.resolveSearchInput }),
            autocomplete: getSearchAutocomplete({ getSearchIndexEntries: arg.searchUseCases.getSearchIndexEntries }),
        },
        help: { run: getHelpCommand() },
        links: { run: getLinksCommand() },
        lfg: {
            run: getLfgCommand({
                getGuildConfig: arg.adminUseCases.getGuildConfig,
                getLfgRoleConfig: arg.adminUseCases.getLfgRoleConfig,
                setLfgRoleLastPingedAt: arg.adminUseCases.setLfgRoleLastPingedAt,
                changeOwnedLfgRoomCode: arg.lfgUseCases.changeOwnedLfgRoomCode,
                createLfgRoom: arg.lfgUseCases.createLfgRoom,
                disbandOwnedLfgRoom: arg.lfgUseCases.disbandOwnedLfgRoom,
                getLfgStatus: arg.lfgUseCases.getLfgStatus,
                kickFromOwnedLfgRoom: arg.lfgUseCases.kickFromOwnedLfgRoom,
                leaveLfgRoom: arg.lfgUseCases.leaveLfgRoom,
                moveLfgUser: arg.lfgUseCases.moveLfgUser,
                transferOwnedLfgRoom: arg.lfgUseCases.transferOwnedLfgRoom,
            }),
            autocomplete: getLfgAutocomplete({ getLfgStatus: arg.lfgUseCases.getLfgStatus }),
        },
        "lfg-manage": {
            run: getLfgManageCommand({
                getGuildConfig: arg.adminUseCases.getGuildConfig,
                changeLfgRoomCode: arg.lfgUseCases.changeLfgRoomCode,
                createLfgRoom: arg.lfgUseCases.createLfgRoom,
                disbandLfgRoom: arg.lfgUseCases.disbandLfgRoom,
                kickFromLfgRoom: arg.lfgUseCases.kickFromLfgRoom,
                moveLfgUser: arg.lfgUseCases.moveLfgUser,
                transferLfgRoom: arg.lfgUseCases.transferLfgRoom,
            }),
            autocomplete: getLfgManageAutocomplete({ getLfgStatus: arg.lfgUseCases.getLfgStatus }),
        },
    };
}
