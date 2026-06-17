import type { InteractionReplyOptions } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type CacheType,
    type ChatInputCommandInteraction,
} from "discord.js";
import { createErrorMessage } from "../bot/message.ts";
import type { ICommand } from "../bot/types.ts";
import { adminCommandInfo } from "./commandInfo.ts";
import {
    ADMIN_ACTION_ADD,
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_REMOVE,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_ROLE_SUBCOMMAND_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
    ADMIN_ROLE_OPTION_NAME,
} from "./constants.ts";
import type { AdminFeature } from "./feature.ts";
import mapAdminFeatureReturnToMessage from "./mapper.ts";

type AdminCommandCtorArg = {
    readonly adminFeature: AdminFeature;
};

export class AdminCommand implements ICommand {
    private readonly adminFeature: AdminFeature;

    public get info() {
        return adminCommandInfo;
    }

    public constructor({ adminFeature }: AdminCommandCtorArg) {
        this.adminFeature = adminFeature;
    }

    public async run(interaction: ChatInputCommandInteraction<CacheType>) {
        const guildId = interaction.guildId;
        if (!guildId) {
            return interaction.reply(
                createErrorMessage<InteractionReplyOptions>({
                    embed: {
                        title: "Admin unavailable",
                        description: "Admin commands are only available in servers.",
                    },
                    flags: MessageFlags.Ephemeral,
                }),
            );
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply(
                createErrorMessage<InteractionReplyOptions>({
                    embed: {
                        title: "Missing permission",
                        description: "You need the Manage Server permission to use admin commands.",
                    },
                    flags: MessageFlags.Ephemeral,
                }),
            );
        }

        const response = await this.runSubcommand(interaction, guildId);
        return interaction.reply(response);
    }

    private async runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
    ): Promise<InteractionReplyOptions> {
        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (group !== ADMIN_LFG_GROUP_NAME) {
            return this.invalidSubcommand();
        }

        switch (subcommand) {
            case ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME:
                return this.runLfgChannel(interaction, guildId);
            case ADMIN_LFG_ROLE_SUBCOMMAND_NAME:
                return this.runLfgRole(interaction, guildId);
            case ADMIN_LFG_SHOW_SUBCOMMAND_NAME:
                return mapAdminFeatureReturnToMessage(await this.adminFeature.getGuildConfig(guildId));
            default:
                return this.invalidSubcommand();
        }
    }

    private async runLfgChannel(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
        const channel = interaction.options.getChannel(ADMIN_CHANNEL_OPTION_NAME, false);

        if (channel && channel.type !== ChannelType.GuildText) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: "Only guild text channels can be used as the LFG public channel.",
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        if (action !== null && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        const result = await this.adminFeature.lfgChannel(guildId, action, channel?.id ?? null);
        return mapAdminFeatureReturnToMessage(result);
    }

    private async runLfgRole(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
        const role = interaction.options.getRole(ADMIN_ROLE_OPTION_NAME, false);

        if (action !== null && action !== ADMIN_ACTION_ADD && action !== ADMIN_ACTION_REMOVE) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    description: `Action must be \`${ADMIN_ACTION_ADD}\` or \`${ADMIN_ACTION_REMOVE}\`.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        const result = await this.adminFeature.lfgRole(guildId, action, role?.id ?? null);
        return mapAdminFeatureReturnToMessage(result);
    }

    private invalidSubcommand() {
        return createErrorMessage<InteractionReplyOptions>({
            embed: {
                title: "Invalid admin command",
                description: "Please specify a valid admin command.",
            },
            flags: MessageFlags.Ephemeral,
        });
    }
}
