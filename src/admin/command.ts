import type { InteractionReplyOptions } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    PermissionFlagsBits,
    type CacheType,
    type ChatInputCommandInteraction,
} from "discord.js";
import { createErrorMessage } from "../bot/message.ts";
import { EMessageKind, type ICommand } from "../bot/types.ts";
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
import type { AdminFeature } from "./feature.ts";

type AdminCommandCtorArg = {
    readonly adminFeature: AdminFeature;
    // TODO: object instead?
    readonly onLfgChannelChange?: (
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        previousChannelId: string | null,
        nextChannelId: string | null,
    ) => Promise<void>;
};

export class AdminCommand implements ICommand {
    private readonly adminFeature: AdminFeature;
    private readonly onLfgChannelChange: AdminCommandCtorArg["onLfgChannelChange"];

    public get info() {
        return adminCommandInfo;
    }

    public constructor({ adminFeature, onLfgChannelChange }: AdminCommandCtorArg) {
        this.adminFeature = adminFeature;
        this.onLfgChannelChange = onLfgChannelChange;
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
            case ADMIN_LFG_SHOW_SUBCOMMAND_NAME:
                return this.adminFeature.lfgShow(guildId);
            default:
                return this.invalidSubcommand();
        }
    }

    private async runLfgChannel(interaction: ChatInputCommandInteraction<CacheType>, guildId: string) {
        // TODO: shouldn't this be required in the original branch?
        const action = interaction.options.getString(ADMIN_ACTION_OPTION_NAME, true);
        const channel = interaction.options.getChannel(ADMIN_CHANNEL_OPTION_NAME, false);

        if (channel && channel.type !== ChannelType.GuildText) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Invalid channel",
                    description: "Only guild text channels can be used as the LFG public channel.",
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        if (action !== ADMIN_ACTION_SET && action !== ADMIN_ACTION_CLEAR) {
            return createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "Invalid action",
                    description: `Action must be \`${ADMIN_ACTION_SET}\` or \`${ADMIN_ACTION_CLEAR}\`.`,
                },
                flags: MessageFlags.Ephemeral,
            });
        }

        const config = await this.adminFeature.getConfig(guildId);
        const previousChannelId = config?.lfgChannel ?? null;
        const response = await this.adminFeature.lfgChannel(guildId, action, channel?.id ?? null);
        // TODO: we KNOW that the same config object is reused because we know about Mikro-ORM,
        // but it this code were ORM-agnostic, we might want to reuse getConfig?
        const nextChannelId = config?.lfgChannel ?? null;
        // TODO: adminFeature.lfgChannel was not refactored into not returing Discord messages anymore
        if (response.kind === EMessageKind.POSITIVE) {
            await this.onLfgChannelChange?.(interaction, guildId, previousChannelId, nextChannelId);
        }
        return response;
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
