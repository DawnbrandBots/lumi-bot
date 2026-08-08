import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ROLE_OPTION_NAME,
} from "../../../../../admin/constants.ts";
import { createErrorMessage } from "../../../../../bot/message.ts";
import { EAdminFeatureReturnKind } from "../../../../../admin/types.ts";
import mapAdminFeatureReturnToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgRole(
    { adminFeature }: TAdminCommandArgs,
    interaction: ChatInputCommandInteraction<CacheType>,
    guildId: string,
): Promise<InteractionReplyOptions> {
    const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
    const role = interaction.options.getRole(ADMIN_ROLE_OPTION_NAME, false);

    if (action !== null && action !== ADMIN_ACTION_ADD && action !== ADMIN_ACTION_REMOVE) {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                description: `Action must be \`${ADMIN_ACTION_ADD}\` or \`${ADMIN_ACTION_REMOVE}\`.`,
            },
            flags: [MessageFlags.Ephemeral],
        });
    }

    if (action === null && !role) {
        const configResult = await adminFeature.getGuildConfig(guildId);
        return mapAdminFeatureReturnToMessage({
            kind: EAdminFeatureReturnKind.LFG_ROLE_HELP,
            value: { roles: configResult.value?.lfgRoles.map((lfgRole) => lfgRole.role) ?? [] },
        });
    }

    if (action === ADMIN_ACTION_ADD && role) {
        return mapAdminFeatureReturnToMessage(await adminFeature.addLfgRole(guildId, role.id));
    }

    if (action === ADMIN_ACTION_REMOVE && role) {
        return mapAdminFeatureReturnToMessage(await adminFeature.removeLfgRole(guildId, role.id));
    }

    if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
        return mapAdminFeatureReturnToMessage({ kind: EAdminFeatureReturnKind.LFG_ROLE_MISSING_ROLE });
    }

    return mapAdminFeatureReturnToMessage({ kind: EAdminFeatureReturnKind.LFG_ROLE_INVALID_OPTIONS });
}

export function getAdminLfgRoleHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (guildId) => runLfgRole(arg, interaction, guildId));
}
