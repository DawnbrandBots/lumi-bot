import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function disband(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.disbandOwnedLfgRoom({ guildId: interaction.guildId, owner: interaction.user });
}
