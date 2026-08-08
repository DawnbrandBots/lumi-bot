import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgJoinHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () =>
                arg.lfgFeature.move({
                    guildId,
                    user: interaction.user,
                    code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                }),
            ),
        );
}
