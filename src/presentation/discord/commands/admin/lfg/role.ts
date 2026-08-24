import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import mapAdminResultToMessage, {
    mapAdminInvalidOptionsToMessage,
    mapAdminLfgRoleHelpToMessage,
    mapAdminMissingValueToMessage,
} from "../../../mappers/admin.ts";
import { createErrorMessage } from "../../../message.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ROLE_OPTION_NAME,
} from "../constants.ts";
import { runWithAdminPermission } from "../runWithAdminPermission.ts";
import type { TAdminCommandArgs, TAdminCommandBase } from "../types.ts";

const runLfgRole: TAdminCommandBase<"useCases.addLfgRole" | "useCases.getGuildConfig" | "useCases.removeLfgRole"> =
    async function (arg, interaction): Promise<InteractionReplyOptions> {
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
            const configResult = await arg.useCases.getGuildConfig({ guildId: interaction.guildId });
            return mapAdminLfgRoleHelpToMessage({
                roles: configResult.value?.lfgRoles.map((lfgRole) => lfgRole.role) ?? [],
            });
        }

        if (action === ADMIN_ACTION_ADD && role) {
            return mapAdminResultToMessage(
                await arg.useCases.addLfgRole({ guildId: interaction.guildId, roleId: role.id }),
            );
        }

        if (action === ADMIN_ACTION_REMOVE && role) {
            return mapAdminResultToMessage(
                await arg.useCases.removeLfgRole({ guildId: interaction.guildId, roleId: role.id }),
            );
        }

        if ((action === ADMIN_ACTION_ADD || action === ADMIN_ACTION_REMOVE) && !role) {
            return mapAdminMissingValueToMessage("Missing role");
        }

        return mapAdminInvalidOptionsToMessage();
    };

export function getAdminLfgRoleHandler(arg: TAdminCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithAdminPermission(interaction, (interaction) => runLfgRole(arg, interaction));
}
