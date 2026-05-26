import debug from "debug";
import {
    ChannelType,
    MessageFlags,
    type BaseMessageOptions,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../admin/feature.ts";
import { ErrorFeatureResponse, SuccessFeatureResponse } from "../bot/featureResponse.ts";
import type { ICommand, IFeatureResponse } from "../bot/types.ts";
import { lfgCommandInfo } from "./commandInfo.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { LfgFeature } from "./feature.ts";

type LfgCommandCtorArg = {
    readonly lfgFeature: LfgFeature;
    readonly adminFeature: Pick<AdminFeature, "getConfig">;
};

const log = debug("bot:lfg");

// TODO: technically not incorrect to not extend Command as long as ICommand is implemented, but then some may wonder why Command even exists?
export class LfgCommand implements ICommand {
    private readonly lfgFeature: LfgFeature;
    private readonly adminFeature: Pick<AdminFeature, "getConfig">;

    public get info() {
        return lfgCommandInfo;
    }

    public constructor({ lfgFeature, adminFeature }: LfgCommandCtorArg) {
        this.lfgFeature = lfgFeature;
        this.adminFeature = adminFeature;
    }

    public async run(interaction: ChatInputCommandInteraction<CacheType>) {
        const guildId = interaction.guildId;
        if (!guildId) {
            return interaction.reply(
                new ErrorFeatureResponse({
                    embed: {
                        title: "LFG unavailable",
                        description: "LFG is only available in servers.",
                    },
                    flags: MessageFlags.Ephemeral,
                }),
            );
        }

        const subcommand = interaction.options.getSubcommand(false);
        const response = await this.runSubcommand(interaction, guildId, subcommand);
        return this.reply(interaction, guildId, response);
    }

    private async reply(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        response: IFeatureResponse,
    ) {
        const config = await this.adminFeature.getConfig(guildId);
        if (!(response instanceof SuccessFeatureResponse) || !config?.channel) {
            return interaction.reply(this.ephemeral(response));
        }

        if (interaction.channelId === config.channel) {
            return interaction.reply(this.publicResponse(response));
        }

        const reply = await interaction.reply(this.ephemeral(response));
        await this.sendPublicCopy(interaction, config.channel, response);
        return reply;
    }

    private async sendPublicCopy(
        interaction: ChatInputCommandInteraction<CacheType>,
        channelId: string,
        response: IFeatureResponse,
    ): Promise<void> {
        try {
            const channel = await interaction.guild?.channels.fetch(channelId);
            if (!channel || channel.type !== ChannelType.GuildText) {
                log(`Configured LFG channel ${channelId} is unavailable or not a guild text channel.`);
                return;
            }
            await channel.send(this.publicResponse(response));
        } catch (error) {
            log("Failed to publish LFG response", error);
        }
    }

    private ephemeral(response: IFeatureResponse): InteractionReplyOptions {
        return { ...response, flags: MessageFlags.Ephemeral };
    }

    private publicResponse(response: IFeatureResponse): BaseMessageOptions {
        const publicResponse = { ...response } as IFeatureResponse & { flags?: unknown };
        delete publicResponse.flags;
        return publicResponse;
    }

    private async runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string | null,
    ): Promise<IFeatureResponse> {
        switch (subcommand) {
            case LFG_CREATE_SUBCOMMAND_NAME:
                return this.lfgFeature.create(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_JOIN_SUBCOMMAND_NAME:
                return this.lfgFeature.join(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_TRANSFER_SUBCOMMAND_NAME:
                return this.lfgFeature.transfer(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_KICK_SUBCOMMAND_NAME:
                return this.lfgFeature.kick(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_LEAVE_SUBCOMMAND_NAME:
                return this.lfgFeature.leave(guildId, interaction.user);
            case LFG_LIST_SUBCOMMAND_NAME:
                return this.lfgFeature.list(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return this.lfgFeature.help();
            default:
                // TODO: can this ever happen?
                return new ErrorFeatureResponse({
                    embed: {
                        title: "Invalid subcommand",
                        description: "Please specify a valid subcommand.",
                    },
                    flags: MessageFlags.Ephemeral,
                });
        }
    }
}
