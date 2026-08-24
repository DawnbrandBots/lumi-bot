import type { InteractionReplyOptions } from "discord.js";
import {
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "../commands/admin/constants.ts";
import type { TCommandRunHandler, TCommandRunHandlers } from "../commands/types.ts";
import type { adminCommandCommandRegistrationData } from "../commandRegistrationData/admin.ts";
import { lfgChannel } from "./admin/lfg/channel.ts";
import { lfgRole } from "./admin/lfg/role.ts";
import { lfgRolePingCooldown } from "./admin/lfg/rolePingCooldown.ts";
import { lfgShow } from "./admin/lfg/show.ts";
import { runWithAdminPermission } from "./admin/runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "./admin/types.ts";
import type { TGuildCommandInteraction } from "./types.ts";

function withAdminPermission<Arg>(
    arg: Arg,
    command: (arg: Arg, interaction: TGuildCommandInteraction) => Promise<InteractionReplyOptions>,
): TCommandRunHandler {
    return (interaction) => runWithAdminPermission(interaction, (interaction) => command(arg, interaction));
}

export function getAdminCommand(arg: TAdminCommandArgs) {
    return {
        [ADMIN_LFG_GROUP_NAME]: {
            [ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME]: withAdminPermission(arg, lfgChannel),
            [ADMIN_LFG_ROLE_SUBCOMMAND_NAME]: withAdminPermission(arg, lfgRole),
            [ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME]: withAdminPermission(arg, lfgRolePingCooldown),
            [ADMIN_LFG_SHOW_SUBCOMMAND_NAME]: withAdminPermission(arg, lfgShow),
        },
    } satisfies TCommandRunHandlers<typeof adminCommandCommandRegistrationData>;
}
