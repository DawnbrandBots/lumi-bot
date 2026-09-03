import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_PLAYER_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandBase } from "./types.ts";

export const kick: TLfgCommandBase<"useCases.lfg.kickPlayerFromOwnedRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.kickPlayerFromOwnedRoom({
        guildId: interaction.guildId,
        owner: interaction.user,
        target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
    });
};
