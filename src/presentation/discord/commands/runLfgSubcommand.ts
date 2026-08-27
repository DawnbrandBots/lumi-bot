import debug from "debug";
import type { InteractionReplyOptions, TextChannel } from "discord.js";
import { ChannelType, MessageFlags, channelMention, roleMention } from "discord.js";
import { ELfgResultKind, type TLfgResult } from "../../../application/lfg/types.ts";
import { mapLfgMessageBaseToReply, mapLfgResultToMessageBase } from "../mappers/lfg.ts";
import { createPositiveMessage } from "../message.ts";
import { EMessageKind } from "../message.types.ts";
import type { TGuildCommandInteraction } from "./types.ts";

const log = debug("bot:lfg");

type TLfgReplyGuildConfig = {
    readonly lfgChannel: string | null;
};

// TODO: convoluted, to remove
function isLfgPingFailureResult(result: TLfgResult): boolean {
    switch (result.kind) {
        case ELfgResultKind.LFG_CHANNEL_NOT_FOUND:
        case ELfgResultKind.LFG_ROLE_CANNOT_BE_EVERYONE:
        case ELfgResultKind.LFG_ROLE_NOT_CONFIGURED:
        case ELfgResultKind.LFG_ROLE_NOT_FOUND:
        case ELfgResultKind.LFG_ROLE_ON_COOLDOWN:
            return true;
        default:
            return false;
    }
}

async function sendPublicCopy(
    interaction: TGuildCommandInteraction,
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

export async function runLfgSubcommand({
    guildConfig,
    interaction,
    result,
}: {
    readonly guildConfig: TLfgReplyGuildConfig | null;
    readonly interaction: TGuildCommandInteraction;
    readonly result: TLfgResult;
}): Promise<void> {
    const messageBase = mapLfgResultToMessageBase({
        result,
        callerId: interaction.user.id,
    });

    // TODO: convoluted, to remove
    if (result.kind === ELfgResultKind.LFG_ROLE_PINGED && interaction.channelId !== result.value.channelId) {
        await sendPublicCopy(interaction, result.value.channelId, messageBase);
        await interaction.reply(
            createPositiveMessage<InteractionReplyOptions>({
                embed: {
                    description: `${roleMention(result.value.roleId)} pinged in ${channelMention(result.value.channelId)}.`,
                },
                flags: [MessageFlags.Ephemeral],
            }),
        );
        return;
    }

    // TODO: convoluted, to remove
    if (isLfgPingFailureResult(result)) {
        await interaction.reply({ ...messageBase, flags: [MessageFlags.Ephemeral] });
        return;
    }

    const message = mapLfgMessageBaseToReply({ messageBase, interaction, guildConfig });

    await interaction.reply(message);
    if (
        messageBase.kind === EMessageKind.POSITIVE &&
        guildConfig?.lfgChannel &&
        interaction.channelId !== guildConfig.lfgChannel
    ) {
        await sendPublicCopy(interaction, guildConfig.lfgChannel, messageBase);
    }
}
