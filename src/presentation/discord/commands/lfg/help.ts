import type { InteractionReplyOptions } from "discord.js";
import { createLfgHelpMessageBase, mapLfgMessageBaseToReply } from "../../mappers/lfg.ts";
import type { TGuildCommandInteraction } from "../types.ts";
import type { TLfgReplyCommandBase } from "./types.ts";

export const help: TLfgReplyCommandBase<"useCases.admin.getGuildConfig"> = async function (
    arg,
    interaction: TGuildCommandInteraction,
): Promise<InteractionReplyOptions> {
    const configResult = await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId });
    return mapLfgMessageBaseToReply({
        messageBase: createLfgHelpMessageBase(),
        interaction,
        guildConfig: configResult.value,
    });
};
