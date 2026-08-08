import type { InteractionReplyOptions } from "discord.js";
import { ChannelType, MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
} from "../../../../../admin/constants.ts";
import { createErrorMessage } from "../../../../../bot/message.ts";
import mapAdminFeatureReturnToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgChannel(
    { adminFeature }: TAdminCommandArgs,
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

    const result = await adminFeature.lfgChannel(guildId, action, channel?.id ?? null);
    return mapAdminFeatureReturnToMessage(result);
}

export function getAdminLfgChannelHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (guildId) => runLfgChannel(arg, interaction, guildId));
}
