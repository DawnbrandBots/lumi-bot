import debug from "debug";
import type { TextChannel } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    channelMention,
    roleMention,
    time,
    userMention,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../admin/feature.ts";
import { Command } from "../bot/command.ts";
import { createErrorMessage, createNegativeMessage, createPositiveMessage } from "../bot/message.ts";
import { EMessageKind } from "../bot/types.ts";
import { lfgCommandInfo } from "./commandInfo.ts";
import {
    LFG_CANNOT_PING_EVERYONE_DESCRIPTION,
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_ROLE_NOT_CONFIGURED_DESCRIPTION,
    LFG_ROLE_OPTION_NAME,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { LfgFeature } from "./feature.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "./mapper.ts";
import { ELfgFeatureReturnKind } from "./types.ts";

const log = debug("bot:lfg");

export function getLfgCommand({
    lfgFeature,
    adminFeature,
}: {
    readonly lfgFeature: LfgFeature;
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
}) {
    async function runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string | null,
    ) {
        switch (subcommand) {
            case LFG_CREATE_SUBCOMMAND_NAME:
                return lfgFeature.create(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_JOIN_SUBCOMMAND_NAME:
                return lfgFeature.move(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_TRANSFER_SUBCOMMAND_NAME:
                return lfgFeature.transferOwnedRoom(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_KICK_SUBCOMMAND_NAME:
                return lfgFeature.kickFromOwnedRoom(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_LEAVE_SUBCOMMAND_NAME:
                return lfgFeature.leave(guildId, interaction.user);
            case LFG_DISBAND_SUBCOMMAND_NAME:
                return lfgFeature.disbandOwnedRoom(guildId, interaction.user);
            case LFG_STATUS_SUBCOMMAND_NAME:
                return lfgFeature.status(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return { kind: ELfgFeatureReturnKind.HELP } as const;
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }

    async function runPing(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        const configResult = await adminFeature.getGuildConfig(guildId);
        const channelId = configResult.value?.lfgChannel;
        if (!channelId) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const channel = await interaction.guild?.channels.fetch(channelId);
        // TODO: this case is good to handle, do add a separate error message however
        // TODO: prevent setting a non text-channel for LFG?
        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const roleId = interaction.options.getRole(LFG_ROLE_OPTION_NAME, true).id;
        if (roleId === guildId) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_CANNOT_PING_EVERYONE_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const roleConfigResult = await adminFeature.getLfgRoleConfig(guildId, roleId);
        if (!roleConfigResult.value) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_ROLE_NOT_CONFIGURED_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const role = await interaction.guild?.roles.fetch(roleId);
        if (!role) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_ROLE_TO_PING_DELETED_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const now = new Date();
        const lastPingedAt = roleConfigResult.value.lastPingedAt;
        const cooldownMinutes = configResult.value?.lfgRolePingCooldownMinutes ?? 0;
        const cooldownMs = cooldownMinutes * 60 * 1000;
        if (lastPingedAt && now.getTime() - new Date(lastPingedAt).getTime() < cooldownMs) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: {
                        // TODO: consider date library or Intl.Temporal (but requires node 26)
                        description: `${roleMention(role.id)} can be pinged again on ${time(
                            new Date(new Date(lastPingedAt).getTime() + cooldownMs),
                        )}.`,
                    },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const pingMessage = {
            content: `${roleMention(roleId)} people, ${userMention(interaction.user.id)} is looking for a room!`,
            allowedMentions: { roles: [roleId], users: [interaction.user.id] },
        };

        let reply;
        if (interaction.channelId === channelId) {
            reply = await interaction.reply(pingMessage);
        } else {
            await channel.send(pingMessage);
            reply = await interaction.reply(
                createPositiveMessage<InteractionReplyOptions>({
                    embed: { description: `${roleMention(roleId)} pinged in ${channelMention(channelId)}.` },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        await adminFeature.setLfgRoleLastPingedAt(guildId, roleId, now);
        return reply;
    }

    async function sendPublicCopy(
        interaction: ChatInputCommandInteraction<CacheType>,
        channelId: string,
        message: Parameters<TextChannel["send"]>[0],
    ): Promise<void> {
        try {
            const channel = await interaction.guild?.channels.fetch(channelId);
            if (!channel || channel.type !== ChannelType.GuildText) {
                log(`Configured LFG channel ${channelId} is unavailable or not a guild text channel.`);
                return;
            }
            await channel.send(message);
        } catch (error) {
            log("Failed to publish LFG response", error);
        }
    }

    return new Command({
        info: lfgCommandInfo,
        run: async function (interaction) {
            const guildId = interaction.guildId;
            if (!guildId) {
                return void interaction.reply(
                    createErrorMessage<InteractionReplyOptions>({
                        embed: {
                            title: "LFG unavailable",
                            description: "LFG is only available in servers.",
                        },
                        flags: MessageFlags.Ephemeral,
                    }),
                );
            }

            const subcommand = interaction.options.getSubcommand(false);
            // TODO: ping does indeed not need to call lfgFeature, since
            // it just answers to Discord directly
            // Still, if feels weird having this check here, apart from the others.
            if (subcommand === LFG_PING_SUBCOMMAND_NAME) {
                return void (await runPing(interaction, guildId));
            }

            const result = await runSubcommand(interaction, guildId, subcommand);
            const configResult = await adminFeature.getGuildConfig(guildId);

            const messageBase = mapLfgFeatureReturnToMessageBase({
                result,
                callerId: interaction.user.id,
                guildConfig: configResult.value,
            });
            const message = mapLfgMessageBaseToReply({ messageBase, interaction, guildConfig: configResult.value });

            await interaction.reply(message);
            if (
                messageBase.kind === EMessageKind.POSITIVE &&
                configResult.value?.lfgChannel &&
                interaction.channelId !== configResult.value.lfgChannel
            ) {
                await sendPublicCopy(interaction, configResult.value.lfgChannel, messageBase);
            }
        },
    });
}
