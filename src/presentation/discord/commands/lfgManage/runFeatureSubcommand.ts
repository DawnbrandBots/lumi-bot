import debug from "debug";
import type { TextChannel } from "discord.js";
import { ChannelType } from "discord.js";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import { mapLfgMessageBaseToReply, mapLfgResultToMessageBase } from "../../mappers/lfg.ts";
import { EMessageKind } from "../../message.types.ts";
import type { TGuildCommandInteraction } from "../types.ts";

const log = debug("bot:lfg-manage");

type TLfgResultGetter = () => MaybePromise<TLfgResult>;
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

export async function runFeatureSubcommand({
    getResult,
    guildConfig,
    interaction,
}: {
    readonly getResult: TLfgResultGetter;
    readonly guildConfig: TLfgReplyGuildConfig | null;
    readonly interaction: TGuildCommandInteraction;
}): Promise<void> {
    const result = await getResult();

    const messageBase = mapLfgResultToMessageBase({
        result,
        callerId: interaction.user.id,
    });
    const message = mapLfgMessageBaseToReply({
        guildConfig,
        messageBase,
        interaction,
    });

    await interaction.reply(message);
    if (
        messageBase.kind === EMessageKind.POSITIVE &&
        guildConfig?.lfgChannel &&
        interaction.channelId !== guildConfig.lfgChannel
    ) {
        await sendPublicCopy(interaction, guildConfig.lfgChannel, messageBase);
    }
}
