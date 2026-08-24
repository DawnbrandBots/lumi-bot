import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandBase } from "./types.ts";

export const join: TLfgCommandBase<"useCases.lfg.movePlayerToRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.movePlayerToRoom({
        guildId: interaction.guildId,
        user: interaction.user,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
