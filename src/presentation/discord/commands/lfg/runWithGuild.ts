import { MessageFlags, type CacheType, type ChatInputCommandInteraction, type InteractionReplyOptions } from "discord.js";
import { createNegativeMessage } from "../../message.ts";

export async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<void>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    description: "LFG is only available in servers.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await run(guildId);
}
