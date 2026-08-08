import type { InteractionReplyOptions } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type CacheType,
    type ChatInputCommandInteraction,
} from "discord.js";
import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import { createErrorMessage } from "../../../bot/message.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
    ADMIN_MINUTES_OPTION_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "../../../admin/constants.ts";
import type { AdminFeature } from "../../../admin/feature.ts";
import mapAdminFeatureReturnToMessage from "../mappers/admin.ts";
import type { adminCommandCommandRegistrationData } from "../commandRegistrationData/admin.ts";

type TAdminCommandArgs = {
    readonly adminFeature: AdminFeature;
};

async function runWithAdminPermission(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<InteractionReplyOptions>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Admin unavailable",
                    description: "Admin commands are only available in servers.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Missing permission",
                    description: "You need the Manage Server permission to use admin commands.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await interaction.reply(await run(guildId));
}

export function getAdminCommand({ adminFeature }: TAdminCommandArgs) {
    async function runLfgChannel(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
    ): Promise<InteractionReplyOptions> {
        const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
        const channel = interaction.options.getChannel(ADMIN_CHANNEL_OPTION_NAME, false);

        if (channel && channel.type !== ChannelType.GuildText) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: "Only guild text channels can be used as the LFG public channel.",
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        if (action !== null && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
                },
                flags: [MessageFlags.Ephemeral],
            });
        }

        const result = await adminFeature.lfgChannel(guildId, action, channel?.id ?? null);
        return mapAdminFeatureReturnToMessage(result);
    }

    async function runLfgRole(
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

        const result = await adminFeature.lfgRole(guildId, action, role?.id ?? null);
        return mapAdminFeatureReturnToMessage(result);
    }

    async function runLfgRolePingCooldown(
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

    return {
        [ADMIN_LFG_GROUP_NAME]: {
            [ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME]: (interaction) =>
                runWithAdminPermission(interaction, (guildId) => runLfgChannel(interaction, guildId)),
            [ADMIN_LFG_ROLE_SUBCOMMAND_NAME]: (interaction) =>
                runWithAdminPermission(interaction, (guildId) => runLfgRole(interaction, guildId)),
            [ADMIN_LFG_ROLE_PING_COOLDOWN_SUBCOMMAND_NAME]: (interaction) =>
                runWithAdminPermission(interaction, (guildId) => runLfgRolePingCooldown(interaction, guildId)),
            [ADMIN_LFG_SHOW_SUBCOMMAND_NAME]: (interaction) =>
                runWithAdminPermission(interaction, async (guildId) =>
                    mapAdminFeatureReturnToMessage(await adminFeature.getGuildConfig(guildId)),
                ),
        },
    } satisfies TCommandRunHandlers<typeof adminCommandCommandRegistrationData>;
}
