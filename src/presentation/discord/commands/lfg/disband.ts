import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandBase } from "./types.ts";

export const disband: TLfgCommandBase<"useCases.lfg.disbandOwnedRoom"> = function (
    arg,
    interaction: TGuildCommandInteraction,
) {
    return arg.useCases.lfg.disbandOwnedRoom({ guildId: interaction.guildId, owner: interaction.user });
};
