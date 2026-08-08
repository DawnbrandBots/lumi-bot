import debug from "debug";
import type { TextChannel } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../../admin/feature.ts";
import type { TCommandHandlers } from "../../bot/commands/types.ts";
import { createErrorMessage } from "../../bot/message.ts";
import { EMessageKind } from "../../bot/types.ts";
import { LFG_CODE_OPTION_NAME, LFG_NEW_CODE_OPTION_NAME, LFG_PLAYER_OPTION_NAME } from "../../lfg/constants.ts";
import type { LfgFeature } from "../../lfg/feature.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "../../lfg/mapper.ts";
import type { TLfgFeatureReturn } from "../../lfg/types.ts";
import getRoomCodeAutocomplete from "../../lfg/utils/roomCodeAutocomplete.ts";
import type { lfgManageCommandCommandRegistrationData } from "../../presentation/discord/commandRegistrationData/lfgManage.ts";
import {
    LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_MANAGE_CREATE_SUBCOMMAND_NAME,
    LFG_MANAGE_DISBAND_SUBCOMMAND_NAME,
    LFG_MANAGE_KICK_SUBCOMMAND_NAME,
    LFG_MANAGE_MOVE_SUBCOMMAND_NAME,
    LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME,
} from "../constants.ts";

const log = debug("bot:lfg-manage");

type TLfgManageCommandArgs = {
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig">;
    readonly lfgFeature: LfgFeature;
};

type TLfgFeatureResultGetter = () => Promise<TLfgFeatureReturn> | TLfgFeatureReturn;

async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<void>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createErrorMessage<InteractionReplyOptions>({
                embed: {
                    title: "LFG management unavailable",
                    description: "LFG management is only available in servers.",
                },
                flags: MessageFlags.Ephemeral,
            }),
        );
        return;
    }

    await run(guildId);
}

async function sendPublicCopy(
    interaction: ChatInputCommandInteraction<CacheType>,
    channelId: string,
    message: Parameters<TextChannel["send"]>[0],
): Promise<void> {
    try {
        const channel = await interaction.guild?.channels.fetch(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            log(`Configured LFG channel ${channelId} is unavailable or not a guild text channel.`);
            return;
        }
        await channel.send(message);
    } catch (error) {
        log("Failed to publish LFG response", error);
    }
}

export function getLfgManageCommand({ adminFeature, lfgFeature }: TLfgManageCommandArgs) {
    async function runFeatureSubcommand(
        interaction: ChatInputCommandInteraction<CacheType>,
        guildId: string,
        getResult: TLfgFeatureResultGetter,
    ): Promise<void> {
        const result = await getResult();
        const configResult = await adminFeature.getGuildConfig(guildId);
        const messageBase = mapLfgFeatureReturnToMessageBase({
            result,
            callerId: interaction.user.id,
            guildConfig: configResult.value,
        });
        const message = mapLfgMessageBaseToReply({
            messageBase,
            interaction,
            guildConfig: configResult.value,
        });

        await interaction.reply(message);
        if (
            messageBase.kind === EMessageKind.POSITIVE &&
            configResult.value?.lfgChannel &&
            interaction.channelId !== configResult.value.lfgChannel
        ) {
            await sendPublicCopy(interaction, configResult.value.lfgChannel, messageBase);
        }
    }

    const autocompleteCode = getRoomCodeAutocomplete({
        lfgFeature,
        ignoredSubCommands: [LFG_MANAGE_CREATE_SUBCOMMAND_NAME],
    });

    return {
        run: {
            [LFG_MANAGE_CREATE_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.create(
                            guildId,
                            interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                            interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                        ),
                    ),
                ),
            [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.move(
                            guildId,
                            interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                            interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                        ),
                    ),
                ),
            [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.changeRoomCode(
                            guildId,
                            interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                            interaction.options.getString(LFG_NEW_CODE_OPTION_NAME, true),
                        ),
                    ),
                ),
            [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.kick(
                            guildId,
                            interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                            interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                        ),
                    ),
                ),
            [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.transfer(
                            guildId,
                            interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                            interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                        ),
                    ),
                ),
            [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: (interaction) =>
                runWithGuild(interaction, (guildId) =>
                    runFeatureSubcommand(interaction, guildId, () =>
                        lfgFeature.disband(guildId, interaction.options.getString(LFG_CODE_OPTION_NAME, true)),
                    ),
                ),
        },
        autocomplete: {
            [LFG_MANAGE_MOVE_SUBCOMMAND_NAME]: {
                [LFG_CODE_OPTION_NAME]: autocompleteCode,
            },
            [LFG_MANAGE_CHANGE_CODE_SUBCOMMAND_NAME]: {
                [LFG_CODE_OPTION_NAME]: autocompleteCode,
            },
            [LFG_MANAGE_KICK_SUBCOMMAND_NAME]: {
                [LFG_CODE_OPTION_NAME]: autocompleteCode,
            },
            [LFG_MANAGE_TRANSFER_SUBCOMMAND_NAME]: {
                [LFG_CODE_OPTION_NAME]: autocompleteCode,
            },
            [LFG_MANAGE_DISBAND_SUBCOMMAND_NAME]: {
                [LFG_CODE_OPTION_NAME]: autocompleteCode,
            },
        },
    } satisfies TCommandHandlers<typeof lfgManageCommandCommandRegistrationData>;
}
