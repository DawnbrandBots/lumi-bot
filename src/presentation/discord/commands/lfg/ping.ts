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
import { createNegativeMessage, createPositiveMessage } from "../../message.ts";
import {
    LFG_CANNOT_PING_EVERYONE_DESCRIPTION,
    LFG_NO_CHANNEL_TO_PING_DESCRIPTION,
    LFG_ROLE_NOT_CONFIGURED_DESCRIPTION,
    LFG_ROLE_OPTION_NAME,
    LFG_ROLE_TO_PING_DELETED_DESCRIPTION,
} from "../../../../lfg/constants.ts";
import { runWithGuild } from "./runWithGuild.ts";
import type { TLfgCommandArgs } from "./types.ts";

async function runPing(
    { adminFeature }: TLfgCommandArgs,
    interaction: ChatInputCommandInteraction<CacheType>,
    guildId: string,
): Promise<void> {
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

export function getLfgPingHandler(arg: TLfgCommandArgs) {
    return (interaction: ChatInputCommandInteraction<CacheType>) =>
        runWithGuild(interaction, (guildId) => runPing(arg, interaction, guildId));
}
