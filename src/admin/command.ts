import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type CacheType,
    type ChatInputCommandInteraction,
} from "discord.js";
import { ErrorFeatureResponse } from "../bot/featureResponse.ts";
import type { ICommand, IFeatureResponse } from "../bot/types.ts";
import { adminCommandInfo } from "./commandInfo.ts";
import {
    ADMIN_ACTION_CLEAR,
    ADMIN_ACTION_OPTION_NAME,
    ADMIN_ACTION_SET,
    ADMIN_CHANNEL_OPTION_NAME,
    ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME,
    ADMIN_LFG_GROUP_NAME,
    ADMIN_LFG_SHOW_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { AdminFeature, AdminLfgChannelAction } from "./feature.ts";

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
                new ErrorFeatureResponse({
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
                new ErrorFeatureResponse({
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
    ): Promise<IFeatureResponse> {
        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand(false);
        if (group !== ADMIN_LFG_GROUP_NAME) {
            return this.invalidSubcommand();
        }

        switch (subcommand) {
            case ADMIN_LFG_CHANNEL_SUBCOMMAND_NAME:
                return this.runLfgChannel(interaction, guildId);
            case ADMIN_LFG_SHOW_SUBCOMMAND_NAME:
                return this.adminFeature.lfgShow(guildId);
            default:
                return this.invalidSubcommand();
        }
    }

    private runLfgChannel(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, false);
        const channel = interaction.options.getChannel(ADMIN_CHANNEL_OPTION_NAME, false);

        if (channel && channel.type !== ChannelType.GuildText) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Invalid channel",
                    description: "Only guild text channels can be used as the LFG public channel.",
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        if (action && action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
            return new ErrorFeatureResponse({
                embed: {
                    title: "Invalid action",
                    description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        return this.adminFeature.lfgChannel(guildId, action as AdminLfgChannelAction | null, channel?.id ?? null);
    }

    private invalidSubcommand() {
        return new ErrorFeatureResponse({
            embed: {
                title: "Invalid admin command",
                description: "Please specify a valid admin command.",
            },
            flags: MessageFlags.Ephemeral,
        });
    }
}
