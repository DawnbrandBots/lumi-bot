import { ChannelType } from "discord.js";
import { ELfgResultKind } from "../../../../application/lfg/types.ts";
import type { TGuildCommandInteraction } from "../types.ts";
import { LFG_ROLE_OPTION_NAME } from "./constants.ts";
import type { TLfgCommandBase } from "./types.ts";

export const ping: TLfgCommandBase<
    "useCases.admin.getGuildConfig" | "useCases.admin.getLfgRoleConfig" | "useCases.admin.setLfgRoleLastPingedAt"
> = async function (arg, interaction: TGuildCommandInteraction) {
    const guildId = interaction.guildId;

    const configResult = await arg.useCases.admin.getGuildConfig({ guildId });
    const channelId = configResult.value?.lfgChannel;
    if (!channelId) {
        return { kind: ELfgResultKind.LFG_CHANNEL_NOT_FOUND };
    }

    const channel = await interaction.guild?.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
        return { kind: ELfgResultKind.LFG_CHANNEL_NOT_FOUND };
    }

    const roleId = interaction.options.getRole(LFG_ROLE_OPTION_NAME, true).id;
    if (roleId === guildId) {
        return { kind: ELfgResultKind.LFG_ROLE_CANNOT_BE_EVERYONE };
    }

    const roleConfigResult = await arg.useCases.admin.getLfgRoleConfig({ guildId, roleId });
    if (!roleConfigResult.value) {
        return { kind: ELfgResultKind.LFG_ROLE_NOT_CONFIGURED };
    }

    const role = await interaction.guild?.roles.fetch(roleId);
    if (!role) {
        return { kind: ELfgResultKind.LFG_ROLE_NOT_FOUND };
    }

    const now = new Date();
    const lastPingedAt = roleConfigResult.value.lastPingedAt;
    const cooldownMinutes = configResult.value?.lfgRolePingCooldownMinutes ?? 0;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    // TODO: this check is application/domain business
    if (lastPingedAt && now.getTime() - new Date(lastPingedAt).getTime() < cooldownMs) {
        return {
            kind: ELfgResultKind.LFG_ROLE_ON_COOLDOWN,
            value: { roleId: role.id, nextPingAt: new Date(new Date(lastPingedAt).getTime() + cooldownMs) },
        };
    }

    await arg.useCases.admin.setLfgRoleLastPingedAt({ guildId, roleId, date: now });
    return { kind: ELfgResultKind.LFG_ROLE_PINGED, value: { channelId, roleId, userId: interaction.user.id } };
};
