import debug from "debug";
import type { TextChannel } from "discord.js";
import {
    ChannelType,
    MessageFlags,
    channelMention,
    roleMention,
    time,
    userMention,
    type CacheType,
    type ChatInputCommandInteraction,
    type InteractionReplyOptions,
} from "discord.js";
import type { AdminFeature } from "../../../admin/feature.ts";
import type { TCommandRunHandlers } from "../../../bot/commands/types.ts";
import { createNegativeMessage, createPositiveMessage } from "../../../bot/message.ts";
import { EMessageKind } from "../../../bot/types.ts";
import {
    LFG_CANNOT_PING_EVERYONE_DESCRIPTION,
    LFG_CHANGE_CODE_SUBCOMMAND_NAME,
    LFG_CODE_OPTION_NAME,
    LFG_CREATE_SUBCOMMAND_NAME,
    LFG_DISBAND_SUBCOMMAND_NAME,
    LFG_HELP_SUBCOMMAND_NAME,
    LFG_JOIN_SUBCOMMAND_NAME,
    LFG_KICK_SUBCOMMAND_NAME,
    LFG_LEAVE_SUBCOMMAND_NAME,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_PING_SUBCOMMAND_NAME,
    LFG_PLAYER_OPTION_NAME,
    LFG_ROLE_NOT_CONFIGURED_DESCRIPTION,
    LFG_ROLE_OPTION_NAME,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
    LFG_STATUS_SUBCOMMAND_NAME,
    LFG_TRANSFER_SUBCOMMAND_NAME,
} from "../../../lfg/constants.ts";
import type { LfgFeature } from "../../../lfg/feature.ts";
import { mapLfgFeatureReturnToMessageBase, mapLfgMessageBaseToReply } from "../mappers/lfg.ts";
import { ELfgFeatureReturnKind, type TLfgFeatureReturn } from "../../../lfg/types.ts";
import type { lfgCommandCommandRegistrationData } from "../commandRegistrationData/lfg.ts";

const log = debug("bot:lfg");

type TLfgCommandArgs = {
    readonly lfgFeature: LfgFeature;
    readonly adminFeature: Pick<AdminFeature, "getGuildConfig" | "getLfgRoleConfig" | "setLfgRoleLastPingedAt">;
};

type TLfgFeatureResultGetter = () => Promise<TLfgFeatureReturn> | TLfgFeatureReturn;

async function runWithGuild(
    interaction: ChatInputCommandInteraction<CacheType>,
    run: (guildId: string) => Promise<void>,
): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) {
        await interaction.reply(
            createNegativeMessage<InteractionReplyOptions>({
                embed: {
                    description: "LFG is only available in servers.",
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

export function getLfgCommand({ lfgFeature, adminFeature }: TLfgCommandArgs) {
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
        const message = mapLfgMessageBaseToReply({ messageBase, interaction, guildConfig: configResult.value });

        await interaction.reply(message);
        if (
            messageBase.kind === EMessageKind.POSITIVE &&
            configResult.value?.lfgChannel &&
            interaction.channelId !== configResult.value.lfgChannel
        ) {
            await sendPublicCopy(interaction, configResult.value.lfgChannel, messageBase);
        }
    }

    async function runPing(interaction: ChatInputCommandInteraction<CacheType>, guildId: string): Promise<void> {
        const configResult = await adminFeature.getGuildConfig(guildId);
        const channelId = configResult.value?.lfgChannel;
        if (!channelId) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const channel = await interaction.guild?.channels.fetch(channelId);
        // TODO: this case is good to handle, do add a separate error message however
        // TODO: prevent setting a non text-channel for LFG?
        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_NO_CHANNEL_TO_PING_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const roleId = interaction.options.getRole(LFG_ROLE_OPTION_NAME, true).id;
        if (roleId === guildId) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_CANNOT_PING_EVERYONE_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const roleConfigResult = await adminFeature.getLfgRoleConfig(guildId, roleId);
        if (!roleConfigResult.value) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_ROLE_NOT_CONFIGURED_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const role = await interaction.guild?.roles.fetch(roleId);
        if (!role) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: { description: LFG_ROLE_TO_PING_DELETED_DESCRIPTION },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const now = new Date();
        const lastPingedAt = roleConfigResult.value.lastPingedAt;
        const cooldownMinutes = configResult.value?.lfgRolePingCooldownMinutes ?? 0;
        const cooldownMs = cooldownMinutes * 60 * 1000;
        if (lastPingedAt && now.getTime() - new Date(lastPingedAt).getTime() < cooldownMs) {
            await interaction.reply(
                createNegativeMessage<InteractionReplyOptions>({
                    embed: {
                        // TODO: consider date library or Intl.Temporal (but requires node 26)
                        description: `${roleMention(role.id)} can be pinged again on ${time(
                            new Date(new Date(lastPingedAt).getTime() + cooldownMs),
                        )}.`,
                    },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
            return;
        }

        const pingMessage = {
            content: `${roleMention(roleId)} people, ${userMention(interaction.user.id)} is looking for a room!`,
            allowedMentions: { roles: [roleId], users: [interaction.user.id] },
        };

        if (interaction.channelId === channelId) {
            await interaction.reply(pingMessage);
        } else {
            await channel.send(pingMessage);
            await interaction.reply(
                createPositiveMessage<InteractionReplyOptions>({
                    embed: { description: `${roleMention(roleId)} pinged in ${channelMention(channelId)}.` },
                    flags: [MessageFlags.Ephemeral],
                }),
            );
        }

        await adminFeature.setLfgRoleLastPingedAt(guildId, roleId, now);
    }

    return {
        [LFG_CREATE_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () =>
                    lfgFeature.create(
                        guildId,
                        interaction.user,
                        interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                    ),
                ),
            ),
        [LFG_CHANGE_CODE_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () =>
                    lfgFeature.changeOwnedRoomCode(
                        guildId,
                        interaction.user,
                        interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                    ),
                ),
            ),
        [LFG_JOIN_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () =>
                    lfgFeature.move(
                        guildId,
                        interaction.user,
                        interaction.options.getString(LFG_CODE_OPTION_NAME, true),
                    ),
                ),
            ),
        [LFG_TRANSFER_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () =>
                    lfgFeature.transferOwnedRoom(
                        guildId,
                        interaction.user,
                        interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                    ),
                ),
            ),
        [LFG_KICK_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () =>
                    lfgFeature.kickFromOwnedRoom(
                        guildId,
                        interaction.user,
                        interaction.options.getUser(LFG_PLAYER_OPTION_NAME, true),
                    ),
                ),
            ),
        [LFG_LEAVE_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () => lfgFeature.leave(guildId, interaction.user)),
            ),
        [LFG_DISBAND_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () => lfgFeature.disbandOwnedRoom(guildId, interaction.user)),
            ),
        [LFG_STATUS_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () => lfgFeature.status(guildId)),
            ),
        [LFG_HELP_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) =>
                runFeatureSubcommand(interaction, guildId, () => ({ kind: ELfgFeatureReturnKind.HELP })),
            ),
        [LFG_PING_SUBCOMMAND_NAME]: (interaction) =>
            runWithGuild(interaction, (guildId) => runPing(interaction, guildId)),
    } satisfies TCommandRunHandlers<typeof lfgCommandCommandRegistrationData>;
}
