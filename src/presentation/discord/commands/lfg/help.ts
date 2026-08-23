import type { InteractionReplyOptions } from "discord.js";
import { createLfgHelpMessageBase, mapLfgMessageBaseToReply } from "../../mappers/lfg.ts";
import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgCommandArgs } from "./types.ts";

export async function help(
    arg: TLfgCommandArgs,
    interaction: TGuildCommandInteraction,
): Promise<InteractionReplyOptions> {
    const configResult = await arg.getGuildConfig({ guildId: interaction.guildId });
    return mapLfgMessageBaseToReply({
        messageBase: createLfgHelpMessageBase(),
        interaction,
        guildConfig: configResult.value,
    });
}
