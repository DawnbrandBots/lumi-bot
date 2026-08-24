import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import type { TGuildCommandInteraction } from "../../types.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ROLE_OPTION_NAME,
} from "../constants.ts";
import { createErrorMessage } from "../../../message.ts";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgRoleHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs } from "../types.ts";

async function runLfgRole(
    { addLfgRole, getGuildConfig, removeLfgRole }: TAdminCommandArgs,
    interaction: TGuildCommandInteraction,
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
        const configResult = await getGuildConfig({ guildId: interaction.guildId });
        return mapAdminLfgRoleHelpToMessage({
            roles: configResult.value?.lfgRoles.map((lfgRole) => lfgRole.role) ?? [],
        });
    }

    if (action === ADMIN_ACTION_ADD && role) {
        return mapAdminResultToMessage(await addLfgRole({ guildId: interaction.guildId, roleId: role.id }));
    }

    if (action === ADMIN_ACTION_REMOVE && role) {
        return mapAdminResultToMessage(await removeLfgRole({ guildId: interaction.guildId, roleId: role.id }));
    }

    if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
        return mapAdminMissingValueToMessage("Missing role");
    }

    return mapAdminInvalidOptionsToMessage();
}

export function getAdminLfgRoleHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (interaction) => runLfgRole(arg, interaction));
}
