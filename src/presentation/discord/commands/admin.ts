import type { InteractionReplyOptions } from "discord.js";
import type { adminCommandCommandRegistrationData } from "../commandRegistrationData/admin.ts";
import {
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "../commands/admin/constants.ts";
import { lfgChannel } from "./admin/lfg/channel.ts";
import { lfgRole } from "./admin/lfg/role.ts";
import { lfgRolePingCooldown } from "./admin/lfg/rolePingCooldown.ts";
import { lfgShow } from "./admin/lfg/show.ts";
import { runWithAdminPermission } from "./admin/runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "./admin/types.ts";
import type { TCommandRunHandler, TCommandRunHandlers, TGuildCommandInteraction } from "./types.ts";

type TAdminCommand = (
    arg: TAdminCommandArgs,
    interaction: TGuildCommandInteraction,
) => Promise<InteractionReplyOptions>;

function withAdminPermission(command: TAdminCommand): TCommandRunHandler {
    return (arg, interaction) =>
        runWithAdminPermission(interaction, (guildInteraction) => command(arg, guildInteraction));
}

export const ADMIN_COMMANDS = {
    [ADMIN_LFG_GROUP_NAME]: {
        [ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME]: withAdminPermission(lfgChannel),
        [ADMIN_LFG_ROLE_SUBCOMMAND_NAME]: withAdminPermission(lfgRole),
        [ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME]: withAdminPermission(lfgRolePingCooldown),
        [ADMIN_LFG_SHOW_SUBCOMMAND_NAME]: withAdminPermission(lfgShow),
    },
} satisfies TCommandRunHandlers<typeof adminCommandCommandRegistrationData>;
