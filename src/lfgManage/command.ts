import debug from "debug";
import type { TextChannel } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../admin/feature.ts";
import { Command } from "../bot/command.ts";
import { createErrorMessage } from "../bot/message.ts";
import { EMessageKind } from "../bot/types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { LfgFeature } from "../lfg/feature.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "../lfg/mapper.ts";
import { ELfgFeatureReturnKind } from "../lfg/types.ts";
import { lfgManageCommandInfo } from "./commandInfo.ts";

const log = debug("bot:lfg-manage");

// TODO: very similar to the regular lfg command
export function getLfgManageCommand({
    adminFeature,
    lfgFeature,
}: {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly lfgFeature: LfgFeature;
}) {
    async function runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string | null,
    ) {
        const code = interaction.options.getString(LFG_CODE_OPTION_NAME, true);
        switch (subcommand) {
            case "create":
                return lfgFeature.create(guildId, interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true), code);
            case "move":
                return lfgFeature.move(guildId, interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true), code);
            case "kick":
                return lfgFeature.kick(guildId, code, interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true));
            case "disband":
                return lfgFeature.disband(guildId, code);
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
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
        info: lfgManageCommandInfo,
        run: async function (interaction) {
            const guildId = interaction.guildId;
            if (!guildId) {
                // TODO: this does not exist in the regular lgf command's .run
                return interaction.reply(
                    createErrorMessage<InteractionReplyOptions>({
                        embed: {
                            title: "LFG management unavailable",
                            description: "LFG management is only available in servers.",
                        },
                        flags: MessageFlags.Ephemeral,
                    }),
                );
            }

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                return interaction.reply(
                    createErrorMessage<InteractionReplyOptions>({
                        embed: {
                            title: "Missing permission",
                            description: "You need the Manage Server permission to manage LFG rooms.",
                        },
                        flags: MessageFlags.Ephemeral,
                    }),
                );
            }

            const result = await runSubcommand(interaction, guildId, interaction.options.getSubcommand(false));
            const configResult = await adminFeature.getGuildConfig(guildId);
            const messageBase = mapLfgFeatureReturnToMessageBase(result, interaction.user.id, configResult.value);
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
