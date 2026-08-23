import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

export function kick(arg: TLfgManageCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.kickFromLfgRoom({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
        target: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
    });
}
