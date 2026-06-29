import { channelMention, MessageFlags, type InteractionReplyOptions } from "discord.js";
import { createErrorMessage, createNeutralMessage, createPositiveMessage } from "../bot/message.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_NO_VALUE,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { TAdminFeatureReturn } from "./types.ts";
import { EAdminFeatureReturnKind } from "./types.ts";

function formatChannel(channel: string | null | undefined): string {
    return channel ? channelMention(channel) : ADMIN_LFG_CHANNEL_NO_VALUE;
}

function mapAdminFeatureReturnToMessage(result: TAdminFeatureReturn) {
    switch (result.kind) {
        case EAdminFeatureReturnKind.LFG_CHANNEL_HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel",
                    description: [
                        // TODO: use discordjs formatters?
                        "Sets the channel where LFG messages are sent.",
                        "By default, LFG messages are only visible to the command user.",
                        "",
                        "**Valid combinations:**",
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME}\`: Show this help and current value.`,
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_SET} ${ADMIN_CHANNEL_OPTION_NAME}:#channel\`: Set the public channel.`,
                        `- \`/admin lfg ${ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_CLEAR}\`: Clear the public channel.`,
                        "",
                        `**Current value:** ${formatChannel(result.value.channel)}`,
                    ].join("\n"),
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_CHANNEL_SET:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel set",
                    description: `LFG messages will be posted in ${channelMention(result.value.channel)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_CHANNEL_CLEARED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG public channel cleared",
                    description: "LFG messages are now only visible by command users.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_CHANNEL_MISSING_CHANNEL:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Missing channel",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_CHANNEL_INVALID_OPTIONS:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Invalid options",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_GET_CONFIG:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG config",
                    fields: [{ name: "Channel", value: formatChannel(result.value?.lfgChannel) }],
                },
                flags: [MessageFlags.Ephemeral],
            });
    }
}

export default mapAdminFeatureReturnToMessage;
