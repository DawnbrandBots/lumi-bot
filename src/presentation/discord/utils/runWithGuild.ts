import {
    MessageFlags,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { TGuildCommandInteraction } from "../commands/types.ts";
import { createNegativeMessage } from "../message.ts";

export type TRunWithGuildArg = {
    readonly notInGuildMessageEmbeddescription: string;
    readonly interaction: ChatInputCommandInteraction<CacheType>;
    readonly run: (interaction: TGuildCommandInteraction) => Promise<void>;
};

export async function runWithGuild({
    notInGuildMessageEmbeddescription: description,
    interaction,
    run,
}: TRunWithGuildArg): Promise<void> {
    if (!interaction.inGuild()) {
        await interaction.reply(
            createNegativeMessage<InteractionReplyOptions>({
                embed: { description },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await run(interaction);
}
