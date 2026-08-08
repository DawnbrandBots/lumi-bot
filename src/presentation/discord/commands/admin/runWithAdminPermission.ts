import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, PermissionFlagsBits, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { createErrorMessage } from "../../../../bot/message.ts";

export async function runWithAdminPermission(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<InteractionReplyOptions>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Admin unavailable",
                    description: "Admin commands are only available in servers.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Missing permission",
                    description: "You need the Manage Server permission to use admin commands.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await interaction.reply(await run(guildId));
}
