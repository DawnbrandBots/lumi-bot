import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandBase } from "./types.ts";

export const changeCode: TLfgCommandBase<"useCases.lfg.changeOwnedRoomCode"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.changeOwnedRoomCode({
        guildId: interaction.guildId,
        owner: interaction.user,
        newCode: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
