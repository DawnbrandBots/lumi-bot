import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_PLAYER_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function transfer(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.transferOwnedRoomToPlayer({
        guildId: interaction.guildId,
        owner: interaction.user,
        target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
    });
}
