import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import mapAdminResultToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs, TAdminCommandBase } from "../types.ts";

const runLfgShow: TAdminCommandBase<"useCases.getGuildConfig"> = async function (arg, interaction) {
    return mapAdminResultToMessage(await arg.useCases.getGuildConfig({ guildId: interaction.guildId }));
};

export function getAdminLfgShowHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (interaction) => runLfgShow(arg, interaction));
}
