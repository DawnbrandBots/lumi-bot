import {
    channelMention,
    codeBlock,
    inlineCode,
    MessageFlags,
    roleMention,
    type InteractionReplyOptions,
} from "discord.js";
import { createErrorMessage, createNeutralMessage, createPositiveMessage } from "../bot/message.ts";
import { LFG_COMMAND_NAME, LFG_PING_SUBCOMMAND_NAME } from "../lfg/constants.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_COMMAND_NAME,
    ADMIN_LFG_CHANNEL_NO_VALUE,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_LIMIT,
    ADMIN_LFG_ROLE_NO_VALUE,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "./constants.ts";
import type { TAdminFeatureReturn } from "./types.ts";
import { EAdminFeatureReturnKind } from "./types.ts";

function formatChannel(channel: string | null | undefined): string {
    return channel ? channelMention(channel) : ADMIN_LFG_CHANNEL_NO_VALUE;
}

function formatRoles(roles: readonly string[] | null | undefined): string {
    return roles?.length ? roles.map((role) => roleMention(role)).join("\n") : ADMIN_LFG_ROLE_NO_VALUE;
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
        case EAdminFeatureReturnKind.LFG_ROLE_HELP:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG ping role",
                    description: [
                        "Sets roles pingable by `/lfg ping`.",
                        "",
                        "**Valid combinations:**",
                        `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME}\`: Show valid options combinations and current pingable roles.`,
                        `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_ADD} ${ADMIN_ROLE_OPTION_NAME}:@role\`: Add a ping role.`,
                        `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_REMOVE} ${ADMIN_ROLE_OPTION_NAME}:@role\`: Remove a ping role.`,
                        "",
                        `**Current options:**\n${formatRoles(result.value.roles)}`,
                    ].join("\n"),
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_ADDED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG ping role added",
                    description: `${roleMention(result.value.role)} can now be pinged by ${inlineCode(`${LFG_COMMAND_NAME} ${LFG_PING_SUBCOMMAND_NAME}`)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_REMOVED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG ping role removed",
                    description: `${roleMention(result.value.role)} can no longer be pinged by ${codeBlock(`${LFG_COMMAND_NAME} ${LFG_PING_SUBCOMMAND_NAME}`)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Missing role",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Invalid options",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_ALREADY_EXISTS:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Role already added",
                    description: `${roleMention(result.value.role)} is already a pingable role.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_NOT_FOUND:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Role not found",
                    description: `${roleMention(result.value.role)} is not a pingable role.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_ROLE_LIMIT_REACHED:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Role limit reached",
                    description: `Servers can configure up to ${ADMIN_LFG_ROLE_LIMIT} LFG pingable roles.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_GET_CONFIG:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG config",
                    fields: [
                        { name: "Channel", value: formatChannel(result.value?.lfgChannel) },
                        {
                            name: "Roles",
                            value: formatRoles(result.value?.lfgRoles.toArray().map((lfgRole) => lfgRole.role)),
                        },
                    ],
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminFeatureReturnKind.LFG_GET_ROLE_CONFIG:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG role config",
                    description: result.value ? roleMention(result.value.role) : ADMIN_LFG_ROLE_NO_VALUE,
                },
                flags: [MessageFlags.Ephemeral],
            });
    }
}

export default mapAdminFeatureReturnToMessage;
