import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_NEW_CODE_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

export function changeCode(arg: TLfgManageCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.changeLfgRoomCode({
        guildId: interaction.guildId,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
        newCode: interaction.options.getString(LFG_NEW_CODE_OPTION_NAME, true),
    });
}
