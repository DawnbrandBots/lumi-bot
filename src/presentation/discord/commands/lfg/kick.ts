import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_PLAYER_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function kick(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.kickFromOwnedLfgRoom({
        guildId: interaction.guildId,
        owner: interaction.user,
        target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
    });
}
