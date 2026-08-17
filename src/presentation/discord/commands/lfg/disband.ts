import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgDisbandHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () =>
                arg.disbandOwnedLfgRoom({ guildId, owner: interaction.user }),
            ),
        );
}
