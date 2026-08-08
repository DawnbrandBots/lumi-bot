import type { CacheType, ChatInputCommandInteraction } from "discord.js";
import mapAdminFeatureReturnToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

export function getAdminLfgShowHandler({ adminFeature }: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, async (guildId) =>
            mapAdminFeatureReturnToMessage(await adminFeature.getGuildConfig(guildId)),
        );
}
