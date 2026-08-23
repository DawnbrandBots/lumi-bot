import {
    MessageFlags,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import { createErrorMessage } from "../../message.ts";
import type { TGuildCommandInteraction } from "../types.ts";

export async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (interaction: TGuildCommandInteraction) => Promise<void>,
): Promise<void> {
    if (!interaction.inGuild()) {
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

    await run(interaction);
}
