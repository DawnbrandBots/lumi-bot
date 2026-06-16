import debug from "debug";
import type { TextChannel } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    roleMention,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../admin/feature.ts";
import { Command } from "../bot/command.ts";
import { createErrorMessage, createNegativeMessage } from "../bot/message.ts";
import { EMessageKind } from "../bot/types.ts";
import { lfgCommandInfo } from "./commandInfo.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_NO_ROLE_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_ROLE_PING_COOLDOWN_MS,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
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
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "setLfgRoleLastPingedAt">;
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
                return lfgFeature.join(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_TRANSFER_SUBCOMMAND_NAME:
                return lfgFeature.transfer(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_KICK_SUBCOMMAND_NAME:
                return lfgFeature.kick(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_LEAVE_SUBCOMMAND_NAME:
                return lfgFeature.leave(guildId, interaction.user);
            case LFG_DISBAND_SUBCOMMAND_NAME:
                return lfgFeature.disband(guildId, interaction.user);
            case LFG_LIST_SUBCOMMAND_NAME:
                return lfgFeature.list(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return lfgFeature.help();
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }

    async function runPing(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        const configResult = await adminFeature.getGuildConfig(guildId);
        const roleId = configResult.value?.lfgRole;
        if (!roleId) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_NO_ROLE_TO_PING_DESCRIPTION },
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
        const lastPingedAt = configResult.value?.lfgRoleLastPingedAt;
        if (lastPingedAt && now.getTime() - new Date(lastPingedAt).getTime() < LFG_ROLE_PING_COOLDOWN_MS) {
            return interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: {
                        // TODO: consider date library or Intl.Temporal (but requires node 26)
                        description: `LFG role can be pinged again at ${new Date(
                            new Date(lastPingedAt).getTime() + LFG_ROLE_PING_COOLDOWN_MS,
                        ).toLocaleString()}.`,
                    },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        const reply = await interaction.reply({
            content: roleMention(roleId),
            allowedMentions: { roles: [roleId] },
        });
        await adminFeature.setLfgRoleLastPingedAt(guildId, now);
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
                return interaction.reply(
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
                return runPing(interaction, guildId);
            }

            const result = await runSubcommand(interaction, guildId, subcommand);
            const configResult = await adminFeature.getGuildConfig(guildId);

            const messageBase = mapLfgFeatureReturnToMessageBase(result);
            const message = mapLfgMessageBaseToReply(messageBase, interaction, configResult.value);

            const reply = await interaction.reply(message);
            if (
                messageBase.kind === EMessageKind.POSITIVE &&
                configResult.value?.lfgChannel &&
                interaction.channelId !== configResult.value.lfgChannel
            ) {
                await sendPublicCopy(interaction, configResult.value.lfgChannel, messageBase);
            }

            return reply;
        },
    });
}
