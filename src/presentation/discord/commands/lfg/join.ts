import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_CODE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandArgs } from "./types.ts";

export function join(arg: TLfgCommandArgs, interaction: TGuildCommandInteraction) {
    return arg.move({
        guildId: interaction.guildId,
        user: interaction.user,
        code: interaction.options.getString(LFG_CODE_OPTION_NAME, true),
    });
}
