import {
    channelMention,
    codeBlock,
    inlineCode,
    MessageFlags,
    roleMention,
    type InteractionReplyOptions,
} from "discord.js";
import { ADMIN_LFG_ROLE_LIMIT } from "../../../application/admin/constants.ts";
import type { TAdminGuildConfig, TAdminResult } from "../../../application/admin/types.ts";
import { EAdminResultKind } from "../../../application/admin/types.ts";
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
    ADMIN_LFG_ROLE_NO_VALUE,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_MINUTES_OPTION_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "../commands/admin/constants.ts";
import { LFG_COMMAND_NAME, LFG_PING_SUBCOMMAND_NAME } from "../commands/lfg/constants.ts";
import { createErrorMessage, createNeutralMessage, createPositiveMessage } from "../message.ts";

function formatChannel(channel: string | null | undefined): string {
    return channel ? channelMention(channel) : ADMIN_LFG_CHANNEL_NO_VALUE;
}

function formatRoles(roles: readonly string[] | null | undefined): string {
    return roles?.length ? roles.map((role) => roleMention(role)).join("\n") : ADMIN_LFG_ROLE_NO_VALUE;
}

function formatRolePingCooldown(cooldown: TAdminGuildConfig["lfgRolePingCooldownMinutes"] | null | undefined): string {
    return cooldown != null ? `${cooldown} minutes` : LFG_NOT_CONFIGURED_DESCRIPTION;
}

export function mapAdminLfgChannelHelpToMessage(arg: { readonly channel: string | null | undefined }) {
    return createNeutralMessage<InteractionReplyOptions>({
        embed: {
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
                `**Current value:** ${formatChannel(arg.channel)}`,
            ].join("\n"),
        },
        flags: [MessageFlags.Ephemeral],
    });
}

export function mapAdminLfgRolePingCooldownHelpToMessage(arg: { readonly minutes: number | null | undefined }) {
    return createNeutralMessage<InteractionReplyOptions>({
        embed: {
            description: [
                "Sets the time between pings for each LFG pingable role.",
                "",
                "**Valid combinations:**",
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME}\`: Show this help and current value.`,
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_SET} ${ADMIN_MINUTES_OPTION_NAME}:30\`: Set the cooldown.`,
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_CLEAR}\`: Clear the cooldown value.`,
                "",
                `**Current value:** ${formatRolePingCooldown(arg.minutes)}`,
            ].join("\n"),
        },
        flags: [MessageFlags.Ephemeral],
    });
}

export function mapAdminLfgRoleHelpToMessage(arg: { readonly roles: readonly string[] }) {
    return createNeutralMessage<InteractionReplyOptions>({
        embed: {
            description: [
                "Sets roles pingable by `/lfg ping`.",
                "",
                "**Valid combinations:**",
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME}\`: Show valid options combinations and current pingable roles.`,
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_ADD} ${ADMIN_ROLE_OPTION_NAME}:@role\`: Add a ping role.`,
                `- \`/${ADMIN_COMMAND_NAME} ${LFG_COMMAND_NAME} ${ADMIN_LFG_ROLE_SUBCOMMAND_NAME} ${ADMIN_ACTION_OPTION_NAME}:${ADMIN_ACTION_REMOVE} ${ADMIN_ROLE_OPTION_NAME}:@role\`: Remove a ping role.`,
                "",
                `**Current options:**\n${formatRoles(arg.roles)}`,
            ].join("\n"),
        },
        flags: [MessageFlags.Ephemeral],
    });
}

export function mapAdminMissingValueToMessage(description: string) {
    return createErrorMessage<InteractionReplyOptions>({
        embed: { description },
        flags: [MessageFlags.Ephemeral],
    });
}

export function mapAdminInvalidOptionsToMessage() {
    return createErrorMessage<InteractionReplyOptions>({
        embed: { description: "Invalid options" },
        flags: [MessageFlags.Ephemeral],
    });
}

function mapAdminResultToMessage(result: TAdminResult) {
    switch (result.kind) {
        case EAdminResultKind.LFG_CHANNEL_SET:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: `LFG messages will be posted in ${channelMention(result.value.channel)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_CHANNEL_CLEARED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: "LFG messages are now only visible by command users.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_PING_COOLDOWN_SET:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: `LFG pingable roles can be pinged every ${formatRolePingCooldown(result.value.minutes)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_PING_COOLDOWN_CLEARED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: "LFG role ping cooldown value was cleared.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_ADDED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: `${roleMention(result.value.role)} can now be pinged by ${inlineCode(`${LFG_COMMAND_NAME} ${LFG_PING_SUBCOMMAND_NAME}`)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_REMOVED:
            return createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: `${roleMention(result.value.role)} can no longer be pinged by ${codeBlock(`${LFG_COMMAND_NAME} ${LFG_PING_SUBCOMMAND_NAME}`)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_ALREADY_EXISTS:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `${roleMention(result.value.role)} is already a pingable role.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_NOT_FOUND:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `${roleMention(result.value.role)} is not a pingable role.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_LIMIT_REACHED:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `Servers can configure up to ${ADMIN_LFG_ROLE_LIMIT} LFG pingable roles.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_ROLE_CANNOT_BE_EVERYONE:
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: "`@everyone` cannot be configured as an LFG pingable role.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_GET_CONFIG:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    fields: [
                        { name: "Channel", value: formatChannel(result.value?.lfgChannel) },
                        {
                            name: "Roles",
                            value: formatRoles(result.value?.lfgRoles.map((lfgRole) => lfgRole.role)),
                        },
                        {
                            name: "Role ping cooldown",
                            value: formatRolePingCooldown(result.value?.lfgRolePingCooldownMinutes),
                        },
                    ],
                },
                flags: [MessageFlags.Ephemeral],
            });
        case EAdminResultKind.LFG_GET_ROLE_CONFIG:
            return createNeutralMessage<InteractionReplyOptions>({
                embed: {
                    description: result.value ? roleMention(result.value.role) : ADMIN_LFG_ROLE_NO_VALUE,
                },
                flags: [MessageFlags.Ephemeral],
            });
    }
}

export default mapAdminResultToMessage;
// TODO: shouldn't this be elsewhere???
const LFG_NOT_CONFIGURED_DESCRIPTION = "Not configured";
