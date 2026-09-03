import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const disband: TLfgManageCommandBase<"useCases.lfg.disbandRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.disbandRoom({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
