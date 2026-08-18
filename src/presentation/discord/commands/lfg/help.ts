import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { createLfgHelpMessageBase, mapLfgMessageBaseToReply } from "../../mappers/lfg.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgHelpHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, async (guildId) => {
            const configResult = await arg.getGuildConfig({ guildId });
            await interaction.reply(
                mapLfgMessageBaseToReply({
                    messageBase: createLfgHelpMessageBase(),
                    interaction,
                    guildConfig: configResult.value,
                }),
            );
        });
}
