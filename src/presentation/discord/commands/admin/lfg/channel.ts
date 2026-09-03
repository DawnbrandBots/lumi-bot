import type { InteractionReplyOptions } from "discord.js";
import { ChannelType, MessageFlags } from "discord.js";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgChannelHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { createErrorMessage } from "../../../message.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
} from "../constants.ts";
import type { TAdminCommandBase } from "../types.ts";

export const lfgChannel: TAdminCommandBase<
    "useCases.admin.clearLfgChannel" | "useCases.admin.getGuildConfig" | "useCases.admin.setLfgChannel"
> = async function (arg, interaction): Promise<InteractionReplyOptions> {
    const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
    const channel = interaction.options.getChannel(ADMIN_CHANNEL_OPTION_NAME, false);

    if (channel && channel.type !== ChannelType.GuildText) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: "Only guild text channels can be used as the LFG public channel.",
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    if (action !== null && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    if (action === null && !channel) {
        const configResult = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
        return mapAdminLfgChannelHelpToMessage({ channel: configResult.value?.lfgChannel });
    }

    if (action === ADMIN_ACTION_SET && channel) {
        return mapAdminResultToMessage(
            await arg.useCases.admin.setLfgChannel({ guildId: interaction.guildId, channelId: channel.id }),
        );
    }

    if (action === ADMIN_ACTION_CLEAR && !channel) {
        return mapAdminResultToMessage(await arg.useCases.admin.clearLfgChannel({ guildId: interaction.guildId }));
    }

    if (action === ADMIN_ACTION_SET && !channel) {
        return mapAdminMissingValueToMessage("Missing channel");
    }

    return mapAdminInvalidOptionsToMessage();
};
