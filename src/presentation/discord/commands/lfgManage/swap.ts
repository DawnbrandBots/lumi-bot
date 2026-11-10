import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_MANAGE_FIRST_PLAYER_OPTION_NAME, LFG_MANAGE_SECOND_PLAYER_OPTION_NAME } from "./constants.ts";
import type { TLfgManageCommandBase } from "./types.ts";

export const swap: TLfgManageCommandBase<"useCases.lfg.swapPlayers"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.swapPlayers({
        guildId: interaction.guildId,
        firstUser: interaction.options.getUser(LFG_MANAGE_FIRST_PLAYER_OPTION_NAME, true),
        secondUser: interaction.options.getUser(LFG_MANAGE_SECOND_PLAYER_OPTION_NAME, true),
    });
};
