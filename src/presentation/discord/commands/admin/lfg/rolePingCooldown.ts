import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_MINUTES_OPTION_NAME,
} from "../../../../../admin/constants.ts";
import { createErrorMessage } from "../../../../../bot/message.ts";
import mapAdminFeatureReturnToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgRolePingCooldown(
    { adminFeature }: TAdminCommandArgs,
    interaction: ChatInputCommandInteraction<CacheType>,
    guildId: string,
): Promise<InteractionReplyOptions> {
    const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
    const minutes = interaction.options.getInteger(ADMIN_MINUTES_OPTION_NAME, false);

    if (action !== null && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    const result = await adminFeature.lfgRolePingCooldown(guildId, action, minutes);
    return mapAdminFeatureReturnToMessage(result);
}

export function getAdminLfgRolePingCooldownHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (guildId) => runLfgRolePingCooldown(arg, interaction, guildId));
}
