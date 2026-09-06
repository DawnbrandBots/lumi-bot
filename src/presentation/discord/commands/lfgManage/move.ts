import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const move: TLfgManageCommandBase<"useCases.lfg.movePlayerToRoomByCode"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.movePlayerToRoomByCode({
        guildId: interaction.guildId,
        user: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
