import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { ELfgFeatureReturnKind } from "../../../../lfg/types.ts";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function getLfgHelpHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () => ({ kind: ELfgFeatureReturnKind.HELP })),
        );
}
