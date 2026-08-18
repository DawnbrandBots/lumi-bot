import type { InteractionReplyOptions } from "discord.js";
import { ChannelType, MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
} from "../constants.ts";
import { createErrorMessage } from "../../../message.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgChannelHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgChannel(
    { clearLfgChannel, getGuildConfig, setLfgChannel }: TAdminCommandArgs,
    interaction: ChatInputCommandInteraction<CacheType>,
    guildId: string,
): Promise<InteractionReplyOptions> {
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
        const configResult = await getGuildConfig({ guildId });
        return mapAdminLfgChannelHelpToMessage({ channel: configResult.value?.lfgChannel });
    }

    if (action === ADMIN_ACTION_SET && channel) {
        return mapAdminResultToMessage(await setLfgChannel({ guildId, channelId: channel.id }));
    }

    if (action === ADMIN_ACTION_CLEAR && !channel) {
        return mapAdminResultToMessage(await clearLfgChannel({ guildId }));
    }

    if (action === ADMIN_ACTION_SET && !channel) {
        return mapAdminMissingValueToMessage("Missing channel");
    }

    return mapAdminInvalidOptionsToMessage();
}

export function getAdminLfgChannelHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (guildId) => runLfgChannel(arg, interaction, guildId));
}
