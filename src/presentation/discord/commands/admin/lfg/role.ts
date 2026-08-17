import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ROLE_OPTION_NAME,
} from "../constants.ts";
import { createErrorMessage } from "../../../message.ts";
import { EAdminResultKind } from "../../../../../application/admin/types.ts";
import mapAdminResultToMessage from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgRole(
    { addLfgRole, getGuildConfig, removeLfgRole }: TAdminCommandArgs,
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
        const configResult = await getGuildConfig(guildId);
        return mapAdminResultToMessage({
            kind: EAdminResultKind.LFG_ROLE_HELP,
            value: { roles: configResult.value?.lfgRoles.map((lfgRole) => lfgRole.role) ?? [] },
        });
    }

    if (action === ADMIN_ACTION_ADD && role) {
        return mapAdminResultToMessage(await addLfgRole(guildId, role.id));
    }

    if (action === ADMIN_ACTION_REMOVE && role) {
        return mapAdminResultToMessage(await removeLfgRole(guildId, role.id));
    }

    if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
        return mapAdminResultToMessage({ kind: EAdminResultKind.LFG_ROLE_MISSING_ROLE });
    }

    return mapAdminResultToMessage({ kind: EAdminResultKind.LFG_ROLE_INVALID_OPTIONS });
}

export function getAdminLfgRoleHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (guildId) => runLfgRole(arg, interaction, guildId));
}
