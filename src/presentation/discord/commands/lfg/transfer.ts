import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { LFG_PLAYER_OPTION_NAME } from "./constants.ts";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgTransferHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () =>
                arg.transferOwnedLfgRoom({
                    guildId,
                    owner: interaction.user,
                    target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                }),
            ),
        );
}
