import debug from "debug";
import type { TextChannel } from "discord.js";
import { ChannelType, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { EMessageKind } from "../../message.types.ts";
import type { TLfgResult } from "../../../../application/lfg/types.ts";
import type { MaybePromise } from "../../../../utils/types.ts";
import { mapLfgResultToMessageBase, mapLfgMessageBaseToReply } from "../../mappers/lfg.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

const log = debug("bot:lfg-manage");

type TLfgResultGetter = () => MaybePromise<TLfgResult>;

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

export async function runFeatureSubcommand(
    { getGuildConfig }: TLfgManageCommandArgs,
    interaction: ChatInputCommandInteraction<CacheType>,
    guildId: string,
    getResult: TLfgResultGetter,
): Promise<void> {
    const result = await getResult();
    const configResult = await getGuildConfig({ guildId });
    const messageBase = mapLfgResultToMessageBase({
        result,
        callerId: interaction.user.id,
        guildConfig: configResult.value,
    });
    const message = mapLfgMessageBaseToReply({
        messageBase,
        interaction,
        guildConfig: configResult.value,
    });

    await interaction.reply(message);
    if (
        messageBase.kind === EMessageKind.POSITIVE &&
        configResult.value?.lfgChannel &&
        interaction.channelId !== configResult.value.lfgChannel
    ) {
        await sendPublicCopy(interaction, configResult.value.lfgChannel, messageBase);
    }
}
