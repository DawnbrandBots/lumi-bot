import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

export function disband(arg: TLfgManageCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.disbandLfgRoom({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
}
