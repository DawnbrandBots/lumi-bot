import mapAdminResultToMessage from "../../../mappers/admin.ts";
import type { TAdminCommandBase } from "../types.ts";

export const lfgShow: TAdminCommandBase<"useCases.admin.getGuildConfig"> = async function (arg, interaction) {
    return mapAdminResultToMessage(await arg.useCases.admin.getGuildConfig({ guildId: interaction.guildId }));
};
