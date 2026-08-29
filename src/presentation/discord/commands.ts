import type { TAllCommandRegistrationData } from "./commandRegistrationData.ts";
import { ADMIN_COMMANDS } from "./commands/admin.ts";
import { help } from "./commands/help.ts";
import { LFG_COMMANDS } from "./commands/lfg.ts";
import { LFG_MANAGE_COMMANDS } from "./commands/lfgManage.ts";
import { links } from "./commands/links.ts";
import { search } from "./commands/search.ts";
import type { TCommandRunRegistry } from "./commands/types.ts";

export const COMMANDS = {
    admin: ADMIN_COMMANDS,
    lfg: LFG_COMMANDS,
    "lfg-manage": LFG_MANAGE_COMMANDS,
    search,
    help,
    links,
} satisfies TCommandRunRegistry<TAllCommandRegistrationData>;

export default COMMANDS;
