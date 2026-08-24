import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_NEW_CODE_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const changeCode: TLfgManageCommandBase<"useCases.lfg.changeRoomCode"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.changeRoomCode({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
        newCode: interaction.options.getString(LFG_NEW_CODE_OPTION_NAME, true),
    });
};
