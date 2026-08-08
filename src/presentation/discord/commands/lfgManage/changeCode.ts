import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import { LFG_CODE_OPTION_NAME, LFG_NEW_CODE_OPTION_NAME } from "../../../../lfg/constants.ts";
import { runFeatureSubcommand } from "./runFeatureSubcommand.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

export function getLfgManageChangeCodeHandler(arg: TLfgManageCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) =>
            runFeatureSubcommand(arg, interaction, guildId, () =>
                arg.lfgFeature.changeRoomCode({
                    guildId,
                    code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                    newCode: interaction.options.getString(LFG_NEW_CODE_OPTION_NAME, true),
                }),
            ),
        );
}
