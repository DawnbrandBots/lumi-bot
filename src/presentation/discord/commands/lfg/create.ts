import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandBase } from "./types.ts";

export const create: TLfgCommandBase<"useCases.lfg.createRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.createRoom({
        guildId: interaction.guildId,
        owner: interaction.user,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
};
