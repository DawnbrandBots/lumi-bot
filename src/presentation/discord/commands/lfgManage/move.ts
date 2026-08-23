import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../lfg/constants.ts";
import type { TLfgManageCommandArgs } from "./types.ts";

export function move(arg: TLfgManageCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.moveLfgUser({
        guildId: interaction.guildId,
        user: interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
}
