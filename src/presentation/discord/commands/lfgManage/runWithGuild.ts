import { MessageFlags, type CacheType, type ChatInputCommandInteraction, type InteractionReplyOptions } from "discord.js";
import { createErrorMessage } from "../../message.ts";

export async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<void>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG management unavailable",
                    description: "LFG management is only available in servers.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await run(guildId);
}
