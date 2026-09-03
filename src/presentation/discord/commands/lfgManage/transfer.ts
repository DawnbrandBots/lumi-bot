import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const transfer: TLfgManageCommandBase<"useCases.lfg.transferRoomToPlayer"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.transferRoomToPlayer({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
        target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
    });
};
