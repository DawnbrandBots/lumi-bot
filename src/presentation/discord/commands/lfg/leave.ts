import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandBase } from "./types.ts";

export const leave: TLfgCommandBase<"useCases.lfg.leaveRoom"> = function (arg, interaction: TGuildCommandInteraction) {
    return arg.useCases.lfg.leaveRoom({ guildId: interaction.guildId, user: interaction.user });
};
