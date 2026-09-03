import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandBase } from "./types.ts";

export const status: TLfgCommandBase<"useCases.lfg.getLfgStatus"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.getLfgStatus({ guildId: interaction.guildId });
};
