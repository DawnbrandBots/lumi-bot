import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { createErrorMessage } from "../bot/message.ts";
import type { ICommand } from "../bot/types.ts";
import { lfgCommandInfo } from "./commandInfo.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { LfgFeature } from "./feature.ts";
import mapLfgFeatureReturnToMessage from "./mapper.ts";
import { ELfgFeatureReturnKind } from "./types.ts";

type LfgCommandCtorArg = {
    readonly lfgFeature: LfgFeature;
};

// TODO: technically not incorrect to not extend Command as long as ICommand is implemented, but then some may wonder why Command even exists?
export class LfgCommand implements ICommand {
    private readonly lfgFeature: LfgFeature;

    public get info() {
        return lfgCommandInfo;
    }

    public constructor({ lfgFeature }: LfgCommandCtorArg) {
        this.lfgFeature = lfgFeature;
    }

    public async run(interaction: ChatInputCommandInteraction<CacheType>) {
        const guildId = interaction.guildId;
        if (!guildId) {
            return interaction.reply(
                createErrorMessage<InteractionReplyOptions>({
                    embed: {
                        title: "LFG unavailable",
                        description: "LFG is only available in servers.",
                    },
                    flags: MessageFlags.Ephemeral,
                }),
            );
        }

        const subcommand = interaction.options.getSubcommand(false);
        const response = mapLfgFeatureReturnToMessage(await this.runSubcommand(interaction, guildId, subcommand));
        return interaction.reply(response);
    }

    private async runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string | null,
    ) {
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
            case LFG_DISBAND_SUBCOMMAND_NAME:
                return this.lfgFeature.disband(guildId, interaction.user);
            case LFG_LIST_SUBCOMMAND_NAME:
                return this.lfgFeature.list(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return this.lfgFeature.help();
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }
}
