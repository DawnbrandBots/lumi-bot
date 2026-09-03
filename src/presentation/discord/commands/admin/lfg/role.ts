import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags } from "discord.js";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgRoleHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { createErrorMessage } from "../../../message.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ROLE_OPTION_NAME,
} from "../constants.ts";
import type { TAdminCommandBase } from "../types.ts";

export const lfgRole: TAdminCommandBase<
    "useCases.admin.addLfgRole" | "useCases.admin.getGuildConfig" | "useCases.admin.removeLfgRole"
> = async function (arg, interaction): Promise<InteractionReplyOptions> {
    const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
    const role = interaction.options.getRole(ADMIN_ROLE_OPTION_NAME, false);

    if (action !== null && action !== ADMIN_ACTION_ADD && action !== ADMIN_ACTION_REMOVE) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: `Action must be \`${ADMIN_ACTION_ADD}\` or \`${ADMIN_ACTION_REMOVE}\`.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    if (action === null && !role) {
        const configResult = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
        return mapAdminLfgRoleHelpToMessage({
            roles: configResult.value?.lfgRoles.map((lfgRole) => lfgRole.role) ?? [],
        });
    }

    if (action === ADMIN_ACTION_ADD && role) {
        return mapAdminResultToMessage(
            await arg.useCases.admin.addLfgRole({ guildId: interaction.guildId, roleId: role.id }),
        );
    }

    if (action === ADMIN_ACTION_REMOVE && role) {
        return mapAdminResultToMessage(
            await arg.useCases.admin.removeLfgRole({ guildId: interaction.guildId, roleId: role.id }),
        );
    }

    if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
        return mapAdminMissingValueToMessage("Missing role");
    }

    return mapAdminInvalidOptionsToMessage();
};
