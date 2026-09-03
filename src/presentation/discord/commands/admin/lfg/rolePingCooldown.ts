import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags } from "discord.js";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgRolePingCooldownHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { createErrorMessage } from "../../../message.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_MINUTES_OPTION_NAME,
} from "../constants.ts";
import type { TAdminCommandBase } from "../types.ts";

export const lfgRolePingCooldown: TAdminCommandBase<
    | "useCases.admin.clearLfgRolePingCooldown"
    | "useCases.admin.getGuildConfig"
    | "useCases.admin.setLfgRolePingCooldown"
> = async function (arg, interaction): Promise<InteractionReplyOptions> {
    const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
    const minutes = interaction.options.getInteger(ADMIN_MINUTES_OPTION_NAME, false);

    if (action !== null && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    if (action === null && minutes === null) {
        const configResult = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
        return mapAdminLfgRolePingCooldownHelpToMessage({
            minutes: configResult.value?.lfgRolePingCooldownMinutes,
        });
    }

    if (action === ADMIN_ACTION_SET && minutes !== null) {
        return mapAdminResultToMessage(
            await arg.useCases.admin.setLfgRolePingCooldown({ guildId: interaction.guildId, minutes }),
        );
    }

    if (action === ADMIN_ACTION_CLEAR && minutes === null) {
        return mapAdminResultToMessage(
            await arg.useCases.admin.clearLfgRolePingCooldown({ guildId: interaction.guildId }),
        );
    }

    if (action === ADMIN_ACTION_SET && minutes === null) {
        return mapAdminMissingValueToMessage("Missing minutes");
    }

    return mapAdminInvalidOptionsToMessage();
};
