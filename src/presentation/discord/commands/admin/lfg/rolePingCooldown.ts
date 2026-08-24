import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import type { TGuildCommandInteraction } from "../../types.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_MINUTES_OPTION_NAME,
} from "../constants.ts";
import { createErrorMessage } from "../../../message.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgRolePingCooldownHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs, TAdminCommandBase } from "../types.ts";

const runLfgRolePingCooldown: TAdminCommandBase<
    "useCases.clearLfgRolePingCooldown" | "useCases.getGuildConfig" | "useCases.setLfgRolePingCooldown"
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
        const configResult = await arg.useCases.getGuildConfig({ guildId: interaction.guildId });
        return mapAdminLfgRolePingCooldownHelpToMessage({
            minutes: configResult.value?.lfgRolePingCooldownMinutes,
        });
    }

    if (action === ADMIN_ACTION_SET && minutes !== null) {
        return mapAdminResultToMessage(
            await arg.useCases.setLfgRolePingCooldown({ guildId: interaction.guildId, minutes }),
        );
    }

    if (action === ADMIN_ACTION_CLEAR && minutes === null) {
        return mapAdminResultToMessage(await arg.useCases.clearLfgRolePingCooldown({ guildId: interaction.guildId }));
    }

    if (action === ADMIN_ACTION_SET && minutes === null) {
        return mapAdminMissingValueToMessage("Missing minutes");
    }

    return mapAdminInvalidOptionsToMessage();
};

export function getAdminLfgRolePingCooldownHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (interaction) => runLfgRolePingCooldown(arg, interaction));
}
