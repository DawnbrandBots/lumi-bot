import debug from "debug";
import type { TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import type { TLfgResult } from "../../../application/lfg/types.ts";
import { mapLfgMessageBaseToReply, mapLfgResultToMessageBase } from "../mappers/lfg.ts";
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
