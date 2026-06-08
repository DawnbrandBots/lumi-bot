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
    LFG_LIST_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "./constants.ts";
import type { LfgFeature } from "./feature.ts";
import mapLfgFeatureReturnToMessage from "./mapper.ts";
import { ELfgFeatureReturnKind } from "./types.ts";

export function getLfgCommand({ lfgFeature }: { readonly lfgFeature: LfgFeature }) {
    async function runSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        subcommand: string | null,
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
            case LFG_LIST_SUBCOMMAND_NAME:
                return lfgFeature.list(guildId);
            case LFG_HELP_SUBCOMMAND_NAME:
                return lfgFeature.help();
            default:
                return { kind: ELfgFeatureReturnKind.INVALID_SUBCOMMAND } as const;
        }
    }

    return new Command({
        info: lfgCommandInfo,
        run: async function (interaction) {
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
            const response = mapLfgFeatureReturnToMessage(await runSubcommand(interaction, guildId, subcommand));
            return interaction.reply(response);
        },
    });
}
