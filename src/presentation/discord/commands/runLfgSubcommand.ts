import debug from "debug";
import type { TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import { type TLfgResult } from "../../../application/lfg/types.ts";
import { mapLfgMessageBaseToInteractionReply, mapLfgResultToMessageBase } from "../mappers/lfg.ts";
import { EMessageKind } from "../message.types.ts";
import type { TGuildCommandInteraction } from "./types.ts";

const log = debug("bot:lfg");

type TLfgReplyGuildConfig = {
    readonly lfgChannel: string | null;
};

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

/**
 * Replies to the interaction.
 *
 * If the interaction was sent from the LFG channel, the reply is public.
 * Else, the reply is ephemeral and a public message is sent to the LFG channel if it exists.
 */
export async function runLfgSubcommand({
    guildConfig,
    interaction,
    result,
}: {
    readonly guildConfig: TLfgReplyGuildConfig | null;
    readonly interaction: TGuildCommandInteraction;
    readonly result: TLfgResult;
}): Promise<void> {
    const lfgChannelExists = !!guildConfig?.lfgChannel;
    const interactionSentFromLfgChannel = lfgChannelExists && interaction.channelId === guildConfig.lfgChannel;

    const maybePublicMessageBase = mapLfgResultToMessageBase({
        result,
        callerId: interaction.user.id,
        isPublic: interactionSentFromLfgChannel,
    });

    const maybePublicMessage = mapLfgMessageBaseToInteractionReply({
        messageBase: maybePublicMessageBase,
        interaction,
        guildConfig,
    });

    await interaction.reply(maybePublicMessage);
    if (maybePublicMessageBase.kind === EMessageKind.POSITIVE && lfgChannelExists && !interactionSentFromLfgChannel) {
        const publicMessageBase = mapLfgResultToMessageBase({
            result,
            callerId: interaction.user.id,
            isPublic: true,
        });
        await sendPublicCopy(interaction, guildConfig.lfgChannel, publicMessageBase);
    }
}
