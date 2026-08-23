import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function changeCode(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.changeOwnedLfgRoomCode({
        guildId: interaction.guildId,
        owner: interaction.user,
        newCode: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
}
