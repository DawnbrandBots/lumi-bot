import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function leave(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.leaveLfgRoom({ guildId: interaction.guildId, user: interaction.user });
}
