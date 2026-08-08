import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { LFG_PLAYER_OPTION_NAME } from "../../../../lfg/constants.ts";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgKickHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () =>
                arg.lfgFeature.kickFromOwnedRoom({
                    guildId,
                    owner: interaction.user,
                    target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                }),
            ),
        );
}
