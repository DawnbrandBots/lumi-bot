import {
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "../commands/admin/constants.ts";
import type { TCommandRunHandlers } from "../commands/types.ts";
import type { adminCommandCommandRegistrationData } from "../commandRegistrationData/admin.ts";
import { getAdminLfgChannelHandler } from "./admin/lfg/channel.ts";
import { getAdminLfgRoleHandler } from "./admin/lfg/role.ts";
import { getAdminLfgRolePingCooldownHandler } from "./admin/lfg/rolePingCooldown.ts";
import { getAdminLfgShowHandler } from "./admin/lfg/show.ts";
import type { TAdminCommandArgs } from "./admin/types.ts";

export function getAdminCommand(arg: TAdminCommandArgs) {
    return {
        [ADMIN_LFG_GROUP_NAME]: {
            [ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME]: getAdminLfgChannelHandler(arg),
            [ADMIN_LFG_ROLE_SUBCOMMAND_NAME]: getAdminLfgRoleHandler(arg),
            [ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME]: getAdminLfgRolePingCooldownHandler(arg),
            [ADMIN_LFG_SHOW_SUBCOMMAND_NAME]: getAdminLfgShowHandler(arg),
        },
    } satisfies TCommandRunHandlers<typeof adminCommandCommandRegistrationData>;
}
