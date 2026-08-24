import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function status(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.status({ guildId: interaction.guildId });
}
