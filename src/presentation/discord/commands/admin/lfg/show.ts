import mapAdminResultToMessage from "../../../mappers/admin.ts";
import type { TAdminCommandBase } from "../types.ts";

export const lfgShow: TAdminCommandBase<"useCases.getGuildConfig"> = async function (arg, interaction) {
    return mapAdminResultToMessage(await arg.useCases.getGuildConfig({ guildId: interaction.guildId }));
};
