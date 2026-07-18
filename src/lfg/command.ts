import type { InteractionReplyOptions } from "discord.js";
import { MessageFlags, type CacheType, type ChatInputCommandInteraction } from "discord.js";
import { Command } from "../bot/command.ts";
import { createErrorMessage } from "../bot/message.ts";
import { lfgCommandInfo } from "./commandInfo.ts";
import {
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { LfgFeature } from "./feature.ts";
import mapLfgFeatureReturnToMessage from "./mapper.ts";
import { ELfgFeatureReturnKind } from "./types.ts";

export function getLfgCommand({ lfgFeature }: { readonly lfgFeature: LfgFeature }) {
    async function runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string,
    ) {
        switch (subcommand) {
            case LFG_CREATE_SUBCOMMAND_NAME:
                return lfgFeature.create(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_JOIN_SUBCOMMAND_NAME:
                return lfgFeature.join(
                    guildId,
                    interaction.user,
                    interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                );
            case LFG_TRANSFER_SUBCOMMAND_NAME:
                return lfgFeature.transfer(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_KICK_SUBCOMMAND_NAME:
                return lfgFeature.kick(
                    guildId,
                    interaction.user,
                    interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                );
            case LFG_LEAVE_SUBCOMMAND_NAME:
                return lfgFeature.leave(guildId, interaction.user);
            case LFG_DISBAND_SUBCOMMAND_NAME:
                return lfgFeature.disband(guildId, interaction.user);
            case LFG_STATUS_SUBCOMMAND_NAME:
                return lfgFeature.status(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return { kind: ELfgFeatureReturnKind.HELP } as const;
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }

    return new Command({
        info: lfgCommandInfo,
        run: async function (interaction) {
            const guildId = interaction.guildId;
            if (!guildId) {
                return void (await interaction.reply(
                    createErrorMessage<InteractionReplyOptions>({
                        embed: {
                            title: "LFG unavailable",
                            description: "LFG is only available in servers.",
                        },
                        flags: MessageFlags.Ephemeral,
                    }),
                ));
            }

            const subcommand = interaction.options.getSubcommand(true);
            const result = await runSubcommand(interaction, guildId, subcommand);
            const response = mapLfgFeatureReturnToMessage({ result, interaction });
            return void (await interaction.reply(response));
        },
    });
}
