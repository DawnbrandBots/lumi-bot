import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const create: TLfgManageCommandBase<"useCases.lfg.createRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.createRoom({
        guildId: interaction.guildId,
        owner: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
