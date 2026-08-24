import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import mapAdminResultToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

export function getAdminLfgShowHandler({ getGuildConfig }: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, async (interaction) =>
            mapAdminResultToMessage(await getGuildConfig({ guildId: interaction.guildId })),
        );
}
