import {
    MessageFlags,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import { createNegativeMessage } from "../../message.ts";
import type { TGuildCommandInteraction } from "../types.ts";

export async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (interaction: TGuildCommandInteraction) => Promise<void>,
): Promise<void> {
    if (!interaction.inGuild()) {
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

    await run(interaction);
}
